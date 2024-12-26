import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
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
    const [groupedResults, setGroupedResults] = useState({});
    const [filterText, setFilterText] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestResults = async () => {
            if (!user || !user.uid) {
                setLoading(false);
                return;
            }

            try {
                const userQuery = query(
                    collection(db, 'users'),
                    where('email', '==', user.email)
                );
                const userSnapshot = await getDocs(userQuery);
                let patientTc = null;
                userSnapshot.forEach((docSnap) => {
                    if (docSnap.exists()) {
                        patientTc = docSnap.data().tcNo;
                    }
                });

                if (!patientTc) {
                    setLoading(false);
                    return;
                }

                const testResultsQuery = query(
                    collection(db, 'testResults'),
                    where('patientTc', '==', patientTc)
                );
                const testResultsSnapshot = await getDocs(testResultsQuery);
                const resultsData = testResultsSnapshot.docs.map((doc) => doc.data());

                let allEvaluations = [];
                resultsData.forEach((result) => {
                    const testDate = result.testDate;
                    if (result.tests && Array.isArray(result.tests)) {
                        result.tests.forEach((t) => {
                            if (
                                t.guideEvaluations &&
                                Array.isArray(t.guideEvaluations) &&
                                t.guideEvaluations.length > 0
                            ) {
                                t.guideEvaluations.forEach((evaluation) => {
                                    allEvaluations.push({
                                        testDate: testDate || 'N/A',
                                        testName: t.testName || 'N/A',
                                        testValue: t.testValue || 'N/A',
                                        guideName: evaluation.guideName || 'N/A',
                                        minValue: evaluation.minValue || 'N/A',
                                        maxValue: evaluation.maxValue || 'N/A',
                                        status: evaluation.status || 'N/A',
                                        unit: evaluation.unit || '', // Assuming unit is part of evaluation
                                    });
                                });
                            } else {
                                allEvaluations.push({
                                    testDate: testDate || 'N/A',
                                    testName: t.testName || 'N/A',
                                    testValue: t.testValue || 'N/A',
                                    guideName: 'N/A',
                                    minValue: 'N/A',
                                    maxValue: 'N/A',
                                    status: 'N/A',
                                    unit: t.unit || '', // Assuming unit might be part of test if not in evaluation
                                });
                            }
                        });
                    }
                });

                setTestResults(allEvaluations);
            } catch (error) {
                console.error('Error fetching test results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTestResults();
    }, [user]);

    useEffect(() => {
        const groupByDateAndTest = (data) => {
            const grouped = data.reduce((acc, item) => {
                const date = item.testDate;
                const test = item.testName;
                if (!acc[date]) {
                    acc[date] = {};
                }
                if (!acc[date][test]) {
                    acc[date][test] = {
                        testValue: item.testValue,
                        unit: item.unit, // Store unit at test level
                        evaluations: [],
                    };
                }
                acc[date][test].evaluations.push({
                    guideName: item.guideName,
                    minValue: item.minValue,
                    maxValue: item.maxValue,
                    status: item.status,
                    unit: item.unit, // Store unit at evaluation level
                });
                return acc;
            }, {});
            return grouped;
        };

        const grouped = groupByDateAndTest(testResults);
        setGroupedResults(grouped);
    }, [testResults]);

    const filteredGroupedResults = useMemo(() => {
        if (filterText.trim() === '') {
            // No filter, return sorted groupedResults
            const sortedDates = Object.keys(groupedResults).sort((a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
            const sortedGrouped = {};
            sortedDates.forEach((date) => {
                sortedGrouped[date] = groupedResults[date];
            });
            return sortedGrouped;
        }

        const lowerFilter = filterText.toLowerCase();
        const grouped = {};

        Object.keys(groupedResults).forEach((date) => {
            const filteredTests = Object.keys(groupedResults[date]).filter((test) => {
                const testNameMatch = test.toLowerCase().includes(lowerFilter);
                const dateMatch = date.toLowerCase().includes(lowerFilter);
                const evaluationsMatch = groupedResults[date][test].evaluations.some((evaluation) =>
                    evaluation.guideName.toLowerCase().includes(lowerFilter)
                );
                return testNameMatch || dateMatch || evaluationsMatch;
            });

            if (filteredTests.length > 0) {
                grouped[date] = {};
                filteredTests.forEach((test) => {
                    grouped[date][test] = groupedResults[date][test];
                });
            }
        });

        // Sort dates
        const sortedDates = Object.keys(grouped).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        const sortedGrouped = {};
        sortedDates.forEach((date) => {
            sortedGrouped[date] = grouped[date];
        });

        return sortedGrouped;
    }, [filterText, groupedResults, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const renderEvaluationItem = (evaluation, index) => {
        const { icon, color } = getStatusInfo(evaluation.status);
        return (
            <View key={index} style={styles.evaluationItem}>
                <Text style={[styles.evaluationStatus, { color: color }]}>
                    Durum: {evaluation.status} {icon}
                </Text>
                <Text style={styles.guideName}>Kılavuz: {evaluation.guideName}</Text>
                <Text style={styles.reference}>
                    Referans: {evaluation.minValue.toFixed(2)} {evaluation.unit} - {evaluation.maxValue} {evaluation.unit}
                </Text>
                <Divider style={{ marginVertical: 5 }} />
            </View>
        );
    };

    const renderTestItem = (test, testName) => {
        let testValueDisplay = 'N/A';
        if (test.testValue !== 'N/A') {
            const testValueNumber = parseFloat(test.testValue);
            if (!isNaN(testValueNumber)) {
                testValueDisplay = `${test.testValue} g/l       ${(testValueNumber * 1000).toFixed(2)} mg/l`;
            }
        }

        return (
            <View key={testName} style={styles.testItem}>
                <Text style={styles.testName}>{testName}</Text>
                <Text style={styles.testValue}>Değer: {testValueDisplay}</Text>
                {test.evaluations && Array.isArray(test.evaluations) && test.evaluations.length > 0 ? (
                    test.evaluations.map((evaluation, idx) =>
                        renderEvaluationItem(evaluation, idx)
                    )
                ) : (
                    <Text style={styles.noEvaluationText}>Değerlendirme bulunamadı.</Text>
                )}
            </View>
        );
    };

    const renderCard = ({ item: date }) => {
        return (
            <Card style={styles.resultCard}>
                <Card.Content>
                    <Text style={styles.resultDate}>{date}</Text>
                    <Divider style={{ marginVertical: 10 }} />
                    {filteredGroupedResults[date] && Object.keys(filteredGroupedResults[date]).length > 0 ? (
                        Object.keys(filteredGroupedResults[date]).map((testName) =>
                            renderTestItem(filteredGroupedResults[date][testName], testName)
                        )
                    ) : (
                        <Text style={styles.noEvaluationText}>Bu tarihte hiç tetkik sonucu bulunmamaktadır.</Text>
                    )}
                </Card.Content>
            </Card>
        );
    };

    const sortedDateKeys = Object.keys(filteredGroupedResults);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tahlil Sonuçları</Text>
            <TextInput
                style={styles.input}
                placeholder="Tetkik veya Tarih ara (örn: IgA, 2024-12-25)"
                value={filterText}
                onChangeText={setFilterText}
            />
            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Tarihe Göre Sırala:</Text>
                <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
                    <Text style={styles.sortButtonText}>
                        {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
                    </Text>
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#3f51b5" style={{ marginTop: 20 }} />
            ) : sortedDateKeys.length > 0 ? (
                <FlatList
                    data={sortedDateKeys}
                    keyExtractor={(item) => item}
                    renderItem={renderCard}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
                />
            ) : (
                <Text style={styles.noDataText}>Sonuç bulunamadı.</Text>
            )}
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
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sortLabel: {
        fontSize: 16,
        marginRight: 10,
    },
    sortButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#3f51b5',
        borderRadius: 5,
    },
    sortButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    resultCard: {
        backgroundColor: '#f2f6ff',
        padding: 15,
        borderRadius: 5,
    },
    resultDate: {
        fontSize: 16,
        marginBottom: 10,
        color: '#555',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    testItem: {
        marginBottom: 10,
    },
    testName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    testValue: {
        fontSize: 16,
        marginVertical: 2,
    },
    evaluationItem: {
        marginLeft: 10,
        marginBottom: 5,
    },
    evaluationStatus: {
        fontSize: 16,
        marginVertical: 2,
    },
    guideName: {
        fontSize: 14,
        color: '#333',
    },
    reference: {
        fontSize: 14,
        color: '#333',
    },
    noEvaluationText: {
        fontSize: 14,
        color: '#777',
        marginTop: 5,
    },
});

export default TestResultsScreen;
