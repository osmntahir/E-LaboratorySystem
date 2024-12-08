import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { parseAgeRange, checkRangeOverlap, sortAgeRanges } from '../../utils/ageRangeHelper';
import { Text, TextInput, Button, Card, Title, IconButton, Subheading, Avatar, Divider, ActivityIndicator, Modal, Portal } from 'react-native-paper';

const TestAnalysisScreen = () => {
    const [testTypes, setTestTypes] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [ageRangeInput, setAgeRangeInput] = useState('');
    const [testValueInput, setTestValueInput] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTestTypes = async () => {
            try {
                const guidesSnapshot = await getDocs(collection(db, 'guides'));
                let testTypeSet = new Set();

                for (const guideDoc of guidesSnapshot.docs) {
                    const testsSnapshot = await getDocs(collection(db, 'guides', guideDoc.id, 'tests'));
                    testsSnapshot.forEach(testDoc => {
                        testTypeSet.add(testDoc.data().name);
                    });
                }
                const sortedTests = Array.from(testTypeSet).sort();
                setTestTypes(sortedTests);
            } catch (error) {
                console.error('Error fetching test types: ', error);
            }
        };
        fetchTestTypes();
    }, []);

    const handleTestSelect = (testName) => {
        setSelectedTest(testName === selectedTest ? null : testName);
    };

    const handleSearch = async () => {
        if (!selectedTest) {
            alert("Lütfen bir test seçiniz.");
            return;
        }

        setIsLoading(true); // Loading başlıyor

        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));
            const newResults = [];

            const userRange = ageRangeInput ? parseAgeRange(ageRangeInput) : null;

            for (const guideDoc of guidesSnapshot.docs) {
                const guideData = guideDoc.data();
                const testsSnapshot = await getDocs(collection(db, 'guides', guideDoc.id, 'tests'));
                let foundTest = null;
                let foundTestId = null;

                testsSnapshot.forEach(testDoc => {
                    if (testDoc.data().name === selectedTest) {
                        foundTest = testDoc.data();
                        foundTestId = testDoc.id;
                    }
                });

                if (foundTest && foundTestId) {
                    const ageGroupsSnapshot = await getDocs(collection(db, 'guides', guideDoc.id, 'tests', foundTestId, 'ageGroups'));
                    let ageGroups = ageGroupsSnapshot.docs.map(doc => doc.data());

                    ageGroups = sortAgeRanges(ageGroups);

                    ageGroups.forEach(ageGroupData => {
                        const guideRange = parseAgeRange(ageGroupData.ageRange);

                        if (userRange) {
                            if (!checkRangeOverlap(userRange, guideRange)) {
                                return;
                            }
                        }

                        let status = null;
                        let adjustedTestValue = parseFloat(testValueInput);

                        if (!isNaN(adjustedTestValue)) {
                            if (guideData.unit === 'mg/L') {
                                adjustedTestValue *= 1000;
                            }

                            const minValue = ageGroupData.minValue;
                            const maxValue = ageGroupData.maxValue;

                            if (adjustedTestValue < minValue) status = 'Düşük';
                            else if (adjustedTestValue > maxValue) status = 'Yüksek';
                            else status = 'Normal';
                        }

                        newResults.push({
                            guideName: guideData.name,
                            testName: selectedTest,
                            ageRange: ageGroupData.ageRange,
                            minValue: ageGroupData.minValue,
                            maxValue: ageGroupData.maxValue,
                            status
                        });
                    });
                }
            }

            setResults(newResults);
        } catch (error) {
            console.error('Error searching test in guides:', error);
        } finally {
            setIsLoading(false); // Loading bitiyor
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Yüksek':
                return {icon: 'arrow-up-bold', color: '#ff4d4f'}; // kırmızı
            case 'Düşük':
                return {icon: 'arrow-down-bold', color: '#faad14'}; // turuncu
            case 'Normal':
                return {icon: 'minus', color: '#52c41a'}; // yeşil
            default:
                return {icon: '', color: '#000'};
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.headerCard}>
                <Card.Title
                    title="Tetkik Analizi"
                    left={(props) => <IconButton {...props} icon="flask" />}
                    titleStyle={styles.headerTitle}
                />
                <Card.Content>
                    <Text style={styles.infoText}>
                        Aşağıdan bir tetkik seçebilir, opsiyonel olarak yaş aralığı ve test değeri girerek sonuçları filtreleyebilirsiniz.
                    </Text>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Tetkik Seçimi" titleStyle={styles.sectionTitle} />
                <Card.Content>
                    {testTypes.map((testName, index) => {
                        const isSelected = selectedTest === testName;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[styles.testTypeItem, isSelected && styles.testTypeItemSelected]}
                                onPress={() => handleTestSelect(testName)}
                            >
                                <Text style={styles.checkbox}>
                                    {isSelected ? '☑' : '☐'}
                                </Text>
                                <Text style={[styles.testName, isSelected && styles.selected]}>{testName}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Filtreler" titleStyle={styles.sectionTitle} />
                <Card.Content>
                    <Text style={styles.label}>Yaş Aralığı (opsiyonel, örn: "0-7", "0-72" veya "cord"):</Text>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        value={ageRangeInput}
                        onChangeText={setAgeRangeInput}
                        placeholder="Yaş aralığı giriniz"
                    />

                    <Text style={styles.label}>Test Değeri (G/L) (opsiyonel):</Text>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        placeholder="Test değeri giriniz (G/L)"
                        keyboardType="numeric"
                        value={testValueInput}
                        onChangeText={setTestValueInput}
                    />

                    <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
                        Ara
                    </Button>
                </Card.Content>
            </Card>

            <Subheading style={styles.resultsHeader}>Sonuçlar</Subheading>
            {results.length === 0 ? (
                <Text style={styles.noResultText}>Arama sonucu yok.</Text>
            ) : (
                results.map((item, index) => {
                    const { icon, color } = getStatusIcon(item.status);
                    return (
                        <Card key={index} style={styles.resultItem}>
                            <Card.Content>
                                <Text style={styles.resultTitle}>Kılavuz: {item.guideName}</Text>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Tetkik:</Text>
                                    <Text style={styles.resultValue}>{item.testName}</Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Yaş Aralığı:</Text>
                                    <Text style={styles.resultValue}>{item.ageRange}</Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Referans Aralık:</Text>
                                    <Text style={styles.resultValue}>{item.minValue} - {item.maxValue}</Text>
                                </View>
                                {item.status && (
                                    <View style={[styles.statusContainer]}>
                                        <View style={styles.statusRow}>
                                            <Avatar.Icon
                                                size={24}
                                                icon={icon}
                                                style={{backgroundColor: 'transparent'}}
                                                color={color}
                                            />
                                            <Text style={[styles.statusText, {color: color}]}>
                                                Durum: {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </Card.Content>
                        </Card>
                    );
                })
            )}

            <Portal>
                <Modal visible={isLoading} dismissable={false} contentContainerStyle={styles.modalContainer}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} size="large" color="#3f51b5" />
                        <Text style={styles.loadingText}>Arama Yapılıyor...</Text>
                    </View>
                </Modal>
            </Portal>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10, backgroundColor: '#f2f2f2', flex: 1 },
    headerCard: {
        borderRadius: 10,
        marginBottom: 20
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        // Bu sayede Modal içeriği ortalanır.
    },
    loadingContainer: {
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: "#fff"
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3f51b5'
    },
    infoText: {
        fontSize: 16,
        color: '#333'
    },
    card: {
        borderRadius: 10,
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3f51b5'
    },
    testTypeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    testTypeItemSelected: {
        backgroundColor: '#e6f7ff'
    },
    checkbox: { marginRight: 10, fontSize: 16 },
    testName: { fontSize: 16, color: '#333' },
    selected: { fontWeight: 'bold', color: '#007acc' },
    label: { marginTop: 15, fontWeight: '600', fontSize: 16, marginBottom: 5 },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff'
    },
    searchButton: {
        marginTop: 10,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
        paddingVertical: 5
    },
    resultsHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3f51b5',
        marginBottom: 10
    },
    noResultText: { textAlign: 'center', fontSize: 16, marginTop: 20, color: '#777' },
    resultItem: {
        marginBottom: 15,
        borderRadius: 10
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    resultRow: {
        flexDirection: 'row',
        marginBottom: 5
    },
    resultLabel: {
        width: 110,
        fontWeight: '600',
        color: '#555'
    },
    resultValue: {
        flex: 1,
        color: '#333'
    },
    statusContainer: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f2f2f2'
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 5
    }
});

export default TestAnalysisScreen;
