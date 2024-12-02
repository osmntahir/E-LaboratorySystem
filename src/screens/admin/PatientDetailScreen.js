// src/screens/PatientDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import TestResultItem from '../../components/items/TestResultItem';

const PatientDetailScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [testResults, setTestResults] = useState([]);

    useEffect(() => {
        const fetchTestResults = async () => {
            try {
                const q = query(collection(db, 'testResults'), where('patientTc', '==', patient.tcNo));
                const querySnapshot = await getDocs(q);
                const testResultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Verinin doğru yapıda olduğunu kontrol et
                console.log('Fetched Test Results:', testResultsData);
                setTestResults(testResultsData);
            } catch (error) {
                console.error('Error fetching test results: ', error);
            }
        };

        fetchTestResults();
    }, []);

    const handleAddTestResult = () => {
        navigation.navigate('AddTestResult', { patient });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.name}>{patient.name} {patient.surname}</Text>
            <Text style={styles.tcNo}>TC No: {patient.tcNo}</Text>
            <Text style={styles.birthDate}>Doğum Tarihi: {patient.birthDate}</Text>
            <Button title="Tahlil Ekle" onPress={handleAddTestResult} />
            <FlatList
                data={testResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TestResultItem testResult={item} />
                )}
                ListEmptyComponent={<Text>Tahlil sonucu bulunmamaktadır.</Text>}
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
    }
});

export default PatientDetailScreen;
