import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import TestResultItem from '../../components/items/TestResultItem';
import { useFocusEffect } from '@react-navigation/native';
import { deleteTestResult } from '../../services/testResultService';

const PatientDetailScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [testResults, setTestResults] = useState([]);

    const fetchTestResults = useCallback(async () => {
        try {
            const q = query(collection(db, 'testResults'), where('patientTc', '==', patient.tcNo));
            const querySnapshot = await getDocs(q);
            const testResultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const sorted = testResultsData.sort((a, b) => {
                const dateA = parseDate(a.testDate);
                const dateB = parseDate(b.testDate);
                return dateB - dateA;
            });

            setTestResults(sorted);
        } catch (error) {
            console.error('Error fetching test results: ', error);
        }
    }, [patient.tcNo]);

    useFocusEffect(
        useCallback(() => {
            fetchTestResults();
        }, [fetchTestResults])
    );

    const parseDate = (dateStr) => {
        const [datePart, timePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));

        let hourInt = 0;
        let minuteInt = 0;
        let secondInt = 0;

        if (timePart) {
            const timeSegments = timePart.split(':');
            hourInt = parseInt(timeSegments[0], 10) || 0;
            minuteInt = parseInt(timeSegments[1], 10) || 0;
            if (timeSegments.length === 3) {
                secondInt = parseInt(timeSegments[2], 10) || 0;
            }
        }

        return new Date(year, month - 1, day, hourInt, minuteInt, secondInt);
    };

    const handleAddTestResult = () => {
        navigation.navigate('AddTestResult', { patient });
    };

    const handleEditTestResult = (testResult) => {
        navigation.navigate('EditTestResult', { testResult, patient });
    };

    const handleDeleteTestResult = (testResultId) => {
        Alert.alert(
            'Silme İşlemi',
            'Bu tahlil sonucunu silmek istediğinize emin misiniz?',
            [
                {
                    text: 'İptal Et',
                    style: 'cancel',
                },
                {
                    text: 'Sil',
                    onPress: async () => {
                        try {
                            await deleteTestResult(testResultId);
                            fetchTestResults();
                        } catch (error) {
                            console.error('Error deleting test result: ', error);
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.resultItem}>
            <TestResultItem testResult={item} />
            <View style={styles.actionsContainer}>
                <Button title="Düzenle" onPress={() => handleEditTestResult(item)} />
                <Button title="Sil" onPress={() => handleDeleteTestResult(item.id)} color="red" />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.name}>{patient.name} {patient.surname}</Text>
            <Text style={styles.tcNo}>TC No: {patient.tcNo}</Text>
            <Text style={styles.birthDate}>Doğum Tarihi: {patient.birthDate}</Text>
            <Button title="Tahlil Ekle" onPress={handleAddTestResult} />
            <FlatList
                data={testResults}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text>Tahlil sonucu bulunmamaktadır.</Text>}
                style={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    tcNo: {
        fontSize: 16
    },
    birthDate: {
        fontSize: 16,
        marginBottom: 10
    },
    list: {
        marginTop: 20
    },
    resultItem: {
        marginBottom: 20,
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 5
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    }
});

export default PatientDetailScreen;
