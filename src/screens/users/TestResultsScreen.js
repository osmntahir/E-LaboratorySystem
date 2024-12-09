import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Card, Divider } from 'react-native-paper';

const getStatusInfo = (status) => {
    switch (status) {
        case 'Yüksek':
            return { icon: '↑', color: '#ff4d4f' };
        case 'Düşük':
            return { icon: '↓', color: '#faad14' };
        case 'Normal':
            return { icon: '→', color: '#52c41a' };
        default:
            return { icon: '', color: '#000' };
    }
};

const TestResultsScreen = () => {
    const { user } = useContext(AuthContext);
    const [testResults, setTestResults] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);

    useEffect(() => {
        const fetchTestResults = async () => {
            if (!user || !user.uid) return;

            const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
            let patientTc = null;
            userDoc.forEach((docSnap) => {
                if (docSnap.exists()) {
                    patientTc = docSnap.data().tcNo;
                }
            });

            if (!patientTc) return;

            const q = query(collection(db, 'testResults'), where('patientTc', '==', patientTc));
            const querySnapshot = await getDocs(q);
            const resultsData = querySnapshot.docs.map(doc => doc.data());

            let allTests = [];
            resultsData.forEach(result => {
                result.tests.forEach(t => {
                    allTests.push({
                        testName: t.testName,
                        testValue: t.testValue,
                        testDate: result.testDate,
                        guideEvaluations: t.guideEvaluations || [],
                    });
                });
            });

            setTestResults(allTests);
            setFilteredResults(allTests);
        };

        fetchTestResults();
    }, [user]);

    useEffect(() => {
        if (filterText.trim() === '') {
            setFilteredResults(testResults);
        } else {
            const filtered = testResults.filter(item =>
                item.testName.toLowerCase().includes(filterText.toLowerCase())
            );
            setFilteredResults(filtered);
        }
    }, [filterText, testResults]);

    const renderItem = ({ item }) => {
        return (
            <Card style={styles.resultItem}>
                <Card.Content>
                    <Text style={styles.resultDate}>{item.testDate}</Text>
                    <Divider style={{ marginVertical: 10 }} />
                    <Text style={styles.testName}>{item.testName}</Text>
                    <Text style={styles.testValue}>Değer: {item.testValue}</Text>
                    <Divider style={{ marginVertical: 10 }} />
                    {item.guideEvaluations.map((evaluation, idx) => {
                        const { icon, color } = getStatusInfo(evaluation.status);
                        return (
                            <View key={idx} style={styles.evaluationContainer}>
                                <Text style={styles.guideName}>Kılavuz: {evaluation.guideName || 'N/A'}</Text>
                                <Text style={styles.reference}>Referans: {evaluation.minValue || 'N/A'} - {evaluation.maxValue || 'N/A'}</Text>
                                <Text style={[styles.evaluationStatus, { color: color }]}>
                                    Durum: {evaluation.status} {icon}
                                </Text>
                                <Divider style={{ marginVertical: 5 }} />
                            </View>
                        );
                    })}
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tahlil Sonuçları</Text>
            <TextInput
                style={styles.input}
                placeholder="Tetkik türü ara (örn: IgA, IgM...)"
                value={filterText}
                onChangeText={setFilterText}
            />
            <FlatList
                data={filteredResults}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.noDataText}>Sonuç bulunamadı.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#3f51b5',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    resultItem: {
        backgroundColor: '#f2f6ff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    resultDate: {
        fontSize: 14,
        marginBottom: 5,
        color: '#555',
        fontWeight: 'bold',
    },
    testName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    testValue: {
        fontSize: 16,
        marginVertical: 5,
    },
    evaluationContainer: {
        marginVertical: 5,
    },
    guideName: {
        fontSize: 14,
    },
    reference: {
        fontSize: 14,
    },
    evaluationStatus: {
        fontSize: 14,
    },
});

export default TestResultsScreen;
