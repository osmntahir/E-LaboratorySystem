// TestResultsScreen.js
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Card, Divider } from 'react-native-paper';

const getStatusIcon = (status) => {
    switch (status) {
        case 'Yüksek':
            return { name: 'arrow-up-circle', color: '#ff4d4f' };
        case 'Düşük':
            return { name: 'arrow-down-circle', color: '#faad14' };
        case 'Normal':
            return { name: 'arrow-forward-circle', color: '#52c41a' };
        default:
            return { name: 'help-circle', color: '#000' };
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
                // Kullanıcıya ait tcNo'yu çekelim
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

                // testResults koleksiyonundan bu tcNo'ya ait kayıtları al
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
                                // Her guideEvaluation'ı ayrı item olarak pushluyoruz
                                t.guideEvaluations.forEach((evaluation) => {
                                    allEvaluations.push({
                                        testDate: testDate || 'N/A',
                                        testName: t.testName || 'N/A',
                                        testValue: t.testValue || 'N/A',
                                        guideName: evaluation.guideName || 'N/A',
                                        minValue: evaluation.minValue || 'N/A',
                                        maxValue: evaluation.maxValue || 'N/A',
                                        status: evaluation.status || 'N/A',
                                        unit: evaluation.unit || '',
                                    });
                                });
                            } else {
                                // guideEvaluations yoksa da yine push
                                allEvaluations.push({
                                    testDate: testDate || 'N/A',
                                    testName: t.testName || 'N/A',
                                    testValue: t.testValue || 'N/A',
                                    guideName: 'N/A',
                                    minValue: 'N/A',
                                    maxValue: 'N/A',
                                    status: 'N/A',
                                    unit: t.unit || '',
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

    // testResults değiştiğinde, tarih ve test adına göre grupluyoruz
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
                    unit: item.unit,
                });
                return acc;
            }, {});
            return grouped;
        };

        const grouped = groupByDateAndTest(testResults);
        setGroupedResults(grouped);
    }, [testResults]);

    // Filtreleme + Tarih sıralama
    const filteredGroupedResults = useMemo(() => {
        // Eğer arama kutusu boşsa => sadece tarih sıralaması
        if (filterText.trim() === '') {
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

        // Arama metni varsa:
        const lowerFilter = filterText.toLowerCase();
        const grouped = {};

        // Tarih bazlı gruplanan veriden filtreye uyan kayıtları seç
        Object.keys(groupedResults).forEach((date) => {
            const filteredTests = Object.keys(groupedResults[date]).filter((test) => {
                const testNameMatch = test.toLowerCase().includes(lowerFilter);
                const dateMatch = date.toLowerCase().includes(lowerFilter);
                const evaluationsMatch = groupedResults[date][test].evaluations.some(
                    (evaluation) =>
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

        // Tarihleri sıralıyoruz
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

    // Değerlendirme öğesini render
    const renderEvaluationItem = (evaluation, index) => {
        const iconData = getStatusIcon(evaluation.status);
        return (
            <View key={index} style={styles.evaluationItem}>
                <View style={styles.statusRow}>
                    <Ionicons
                        name={iconData.name}
                        size={18}
                        color={iconData.color}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.evaluationStatus, { color: iconData.color }]}>
                        {evaluation.status}
                    </Text>
                </View>
                <Text style={styles.guideName}>
                    <Ionicons name="book" size={14} color="#333" /> {`Kılavuz: ${evaluation.guideName}`}
                </Text>
                {(evaluation.minValue !== 'N/A' && evaluation.maxValue !== 'N/A') ? (
                    <Text style={styles.reference}>
                        <Ionicons name="analytics" size={14} color="#333" /> Referans Aralığı: {parseFloat(evaluation.minValue).toFixed(2)} {evaluation.unit} - {parseFloat(evaluation.maxValue).toFixed(2)} {evaluation.unit}
                    </Text>
                ) : (
                    <Text style={styles.reference}>
                        <Ionicons name="analytics" size={14} color="#ccc" /> Referans Aralığı: N/A
                    </Text>
                )}
                <Divider style={{ marginVertical: 8 }} />
            </View>
        );
    };

    // Bir testin bilgisini render
    const renderTestItem = (test, testName) => {
        let testValueDisplay = 'N/A';

        if (test.testValue !== 'N/A') {
            const testValueNumber = parseFloat(test.testValue);
            if (!isNaN(testValueNumber)) {
                testValueDisplay = `${test.testValue} g/L   (${(testValueNumber * 1000).toFixed(2)} mg/L)`;
            }
        }

        return (
            <View key={testName} style={styles.testItem}>
                <View style={styles.testNameRow}>
                    <Ionicons name="flask" size={18} color="#3f51b5" style={{ marginRight: 6 }}/>
                    <Text style={styles.testName}>{testName}</Text>
                </View>

                <Text style={styles.testValue}>
                    <Ionicons name="thermometer" size={16} color="#666" /> {` Değer: ${testValueDisplay}`}
                </Text>

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

    // Tarih bazında Card
    const renderCard = ({ item: date }) => {
        return (
            <Card style={styles.resultCard}>
                <Card.Content>
                    <View style={styles.dateHeader}>
                        <Ionicons name="calendar" size={18} color="#555" style={{ marginRight: 6 }}/>
                        <Text style={styles.resultDate}>{date}</Text>
                    </View>
                    <Divider style={{ marginVertical: 10 }} />
                    {filteredGroupedResults[date] &&
                    Object.keys(filteredGroupedResults[date]).length > 0 ? (
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

            <View style={styles.searchRow}>
                <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.input}
                    placeholder="Tetkik veya Tarih ara (örn: IgA, 2024-12-25)"
                    value={filterText}
                    onChangeText={setFilterText}
                />
            </View>

            <View style={styles.sortContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="timer" size={18} color="#3f51b5" style={{ marginRight: 6 }} />
                    <Text style={styles.sortLabel}>Tarihe Göre Sırala:</Text>
                </View>

                <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
                    <Ionicons
                        name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#fff"
                        style={{ marginRight: 5 }}
                    />
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

export default TestResultsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f2f6ff',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3f51b5',
        marginBottom: 16,
        textAlign: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 15,
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sortLabel: {
        fontSize: 16,
        color: '#333',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3f51b5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    sortButtonText: {
        fontSize: 14,
        color: '#fff',
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 5,
    },
    resultDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
    },
    testItem: {
        marginBottom: 12,
    },
    testNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    testName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    testValue: {
        fontSize: 15,
        color: '#444',
        marginBottom: 8,
        marginLeft: 24, // biraz içeri itelim
    },
    evaluationItem: {
        marginLeft: 24, // testValue altında sıralansın
        marginBottom: 5,
        borderLeftWidth: 2,
        borderLeftColor: '#e0e0e0',
        paddingLeft: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    evaluationStatus: {
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 2,
    },
    guideName: {
        fontSize: 14,
        color: '#333',
        marginTop: 2,
    },
    reference: {
        fontSize: 14,
        color: '#333',
        marginTop: 2,
    },
    noEvaluationText: {
        fontSize: 14,
        color: '#888',
        marginLeft: 24,
        marginTop: 5,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        color: '#777',
    },
});
