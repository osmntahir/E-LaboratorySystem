// src/screens/admin/TestAnalysisScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import {
    parseAgeRange,
    checkRangeInclusion,
    sortAgeRanges,
} from '../../utils/ageRangeHelper';
import {
    Text,
    TextInput,
    Button,
    Card,
    IconButton,
    Subheading,
    Avatar,
    Divider,
    Modal,
    Portal,
} from 'react-native-paper';


const TestAnalysisScreen = () => {
    const [testTypes, setTestTypes] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);

    const [ageRangeInput, setAgeRangeInput] = useState('');
    const [testValueInput, setTestValueInput] = useState('');

    const [results, setResults] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAllTestTypes();
    }, []);

    /**
     * Firestore'da `guides` koleksiyonunu çekip,
     * her dokümandaki `testTypes` dizisinden tüm test isimlerini toplayıp kaydediyoruz.
     */
    const fetchAllTestTypes = async () => {
        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));
            const testNameSet = new Set();

            // Her kılavuz dokümanındaki testTypes dizisinden testName toplanıyor
            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();
                if (Array.isArray(guideData.testTypes)) {
                    guideData.testTypes.forEach((test) => {
                        if (test.name) {
                            testNameSet.add(test.name);
                        }
                    });
                }
            });

            const sortedTests = Array.from(testNameSet).sort();
            setTestTypes(sortedTests);
        } catch (error) {
            console.error('Error fetching test types: ', error);
        }
    };

    const handleTestSelect = (testName) => {
        // Aynı testName'e tekrar basılırsa seçimi kaldır
        if (selectedTest === testName) {
            setSelectedTest(null);
        } else {
            setSelectedTest(testName);
        }
    };

    const handleSearch = async () => {
        if (!selectedTest) {
            alert('Lütfen bir test seçiniz.');
            return;
        }

        setIsLoading(true); // Yükleniyor durumunu başlattık

        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));
            const newResults = [];
            // Kullanıcının girdiği yaş aralığı
            const userRange = ageRangeInput ? parseAgeRange(ageRangeInput) : null;

            // Her kılavuz dokümanını dolaş
            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();

                // testTypes dizisinden seçilen testi bul
                if (!Array.isArray(guideData.testTypes)) {
                    return;
                }

                const foundTest = guideData.testTypes.find((t) => t.name === selectedTest);
                if (!foundTest) {
                    return; // Bu kılavuzda seçilen test yok
                }

                // foundTest içinde ageGroups dizisi
                if (!Array.isArray(foundTest.ageGroups)) {
                    return;
                }

                // Yaş gruplarını sıralıyoruz
                let ageGroups = sortAgeRanges(foundTest.ageGroups);

                // Her ageGroup için, userRange ile tam içerim var mı bak
                ageGroups.forEach((ageGroupData) => {
                    const guideRange = parseAgeRange(ageGroupData.ageRange);
                    if (userRange) {
                        if (!checkRangeInclusion(userRange, guideRange)) {
                            return; // Tam içerim yoksa bu ageGroup'u atla
                        }
                    }

                    // Test değeri statüsü (Düşük, Normal, Yüksek) hesapla
                    let status = null;
                    let adjustedTestValue = parseFloat(testValueInput);

                    if (!isNaN(adjustedTestValue)) {
                        // eğer guideData.unit === 'mg/L' => girilen g/L'yi mg/L'ye çevir
                        if (guideData.unit === 'mg/L') {
                            adjustedTestValue = adjustedTestValue * 1000;
                        }

                        const minValue = ageGroupData.minValue ?? 0;
                        const maxValue = ageGroupData.maxValue ?? Infinity;

                        if (adjustedTestValue < minValue) status = 'Düşük';
                        else if (adjustedTestValue > maxValue) status = 'Yüksek';
                        else status = 'Normal';
                    }

                    newResults.push({
                        guideName: guideData.name || 'N/A',
                        testName: foundTest.name,
                        ageRange: ageGroupData.ageRange,
                        minValue: ageGroupData.minValue,
                        maxValue: ageGroupData.maxValue,
                        status,
                    });
                });
            });

            setResults(newResults);
        } catch (error) {
            console.error('Error searching test in guides:', error);
        } finally {
            setIsLoading(false); // Yükleniyor bitti
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Yüksek':
                return { icon: 'arrow-up-bold', color: '#ff4d4f' }; // Kırmızı
            case 'Düşük':
                return { icon: 'arrow-down-bold', color: '#faad14' }; // Turuncu
            case 'Normal':
                return { icon: 'minus', color: '#52c41a' }; // Yeşil
            default:
                return { icon: '', color: '#000' };
        }
    };

    // **Move styles definition above the return statement**
    const styles = StyleSheet.create({
        container: { padding: 10, backgroundColor: '#f2f2f2', flex: 1 },
        headerCard: {
            borderRadius: 10,
            marginBottom: 20,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#3f51b5',
        },
        infoText: {
            fontSize: 16,
            color: '#333',
        },
        card: {
            borderRadius: 10,
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#3f51b5',
        },
        testTypeItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: '#eee',
        },
        testTypeItemSelected: {
            backgroundColor: '#e6f7ff',
        },
        checkbox: { marginRight: 10, fontSize: 16 },
        testName: { fontSize: 16, color: '#333' },
        selected: { fontWeight: 'bold', color: '#007acc' },
        label: { marginTop: 15, fontWeight: '600', fontSize: 16, marginBottom: 5 },
        input: {
            marginBottom: 15,
            backgroundColor: '#fff',
        },
        searchButton: {
            marginTop: 10,
            borderRadius: 5,
            backgroundColor: '#3f51b5',
            paddingVertical: 5,
        },
        resultsHeader: {
            fontSize: 18,
            fontWeight: '600',
            color: '#3f51b5',
            marginBottom: 10,
        },
        noResultContainer: {
            alignItems: 'center',
            marginTop: 20,
        },
        noResultText: {
            fontSize: 16,
            color: '#777',
        },
        resultItem: {
            marginBottom: 15,
            borderRadius: 10,
        },
        resultTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: '#333',
        },
        resultRow: {
            flexDirection: 'row',
            marginBottom: 5,
        },
        resultLabel: {
            width: 110,
            fontWeight: '600',
            color: '#555',
        },
        resultValue: {
            flex: 1,
            color: '#333',
        },
        statusContainer: {
            marginTop: 10,
            padding: 10,
            borderRadius: 5,
            backgroundColor: '#f2f2f2',
        },
        statusRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        statusText: {
            fontWeight: 'bold',
            fontSize: 16,
            marginLeft: 5,
        },
        modalContainer: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingContainer: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        loadingText: {
            marginTop: 10,
            fontSize: 18,
            color: '#fff',
        },
    });

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        >
            {/* Başlık Kartı */}
            <Card style={styles.headerCard}>
                <Card.Title
                    title="Tetkik Analizi"
                    left={(props) => <IconButton {...props} icon="flask" />}
                    titleStyle={styles.headerTitle}
                />
                <Card.Content>
                    <Text style={styles.infoText}>
                        Aşağıdan bir tetkik seçebilir, opsiyonel olarak yaş aralığı ve test
                        değeri girerek sonuçları filtreleyebilirsiniz.
                    </Text>
                </Card.Content>
            </Card>

            {/* Test Seçimi */}
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
                                <Text style={styles.checkbox}>{isSelected ? '☑' : '☐'}</Text>
                                <Text style={[styles.testName, isSelected && styles.selected]}>
                                    {testName}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </Card.Content>
            </Card>

            {/* Filtreler Kartı */}
            <Card style={styles.card}>
                <Card.Title title="Filtreler" titleStyle={styles.sectionTitle} />
                <Card.Content>
                    <Text style={styles.label}>
                        Yaş Aralığı (opsiyonel, örn: "0-7", "0-72" veya "cord"):
                    </Text>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        value={ageRangeInput}
                        onChangeText={setAgeRangeInput}
                        placeholder="Yaş aralığı giriniz (örn: 0-12, cord)"
                    />

                    <Text style={styles.label}>Test Değeri (g/L) (opsiyonel):</Text>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        placeholder="Test değeri giriniz (g/L)"
                        keyboardType="numeric"
                        value={testValueInput}
                        onChangeText={setTestValueInput}
                    />

                    <Button mode="contained" onPress={handleSearch} style={styles.searchButton}>
                        Ara
                    </Button>
                </Card.Content>
            </Card>

            {/* Sonuçlar Bölümü */}
            <Subheading style={styles.resultsHeader}>Sonuçlar</Subheading>
            {results.length === 0 ? (
                <View style={styles.noResultContainer}>
                    <Text style={styles.noResultText}>Arama sonucu yok.</Text>
                </View>
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
                                    <Text style={styles.resultValue}>
                                        {item.minValue} - {item.maxValue}
                                    </Text>
                                </View>
                                {item.status && (
                                    <View style={styles.statusContainer}>
                                        <View style={styles.statusRow}>
                                            <Avatar.Icon
                                                size={24}
                                                icon={icon}
                                                style={{ backgroundColor: 'transparent' }}
                                                color={color}
                                            />
                                            <Text style={[styles.statusText, { color: color }]}>
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

            {/* Loading Modal */}
            <Portal>
                <Modal
                    visible={isLoading}
                    dismissable={false}
                    contentContainerStyle={styles.modalContainer}
                >
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} size="large" color="#3f51b5" />
                        <Text style={styles.loadingText}>Arama Yapılıyor...</Text>
                    </View>
                </Modal>
            </Portal>
        </ScrollView>
    );
};

export default TestAnalysisScreen;
