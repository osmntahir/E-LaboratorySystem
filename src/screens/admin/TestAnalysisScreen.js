// src/screens/TestAnalysisScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { parseAgeRange, checkRangeOverlap, sortAgeRanges } from '../../utils/ageRangeHelper';

const TestAnalysisScreen = () => {
    const [testTypes, setTestTypes] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [ageRangeInput, setAgeRangeInput] = useState('');
    const [testValueInput, setTestValueInput] = useState('');
    const [results, setResults] = useState([]);

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

        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));
            const newResults = [];

            // Kullanıcının girdiği yaş aralığını parse et
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

                    // Yaş gruplarını azalandan artana sırala
                    ageGroups = sortAgeRanges(ageGroups);

                    ageGroups.forEach(ageGroupData => {
                        const guideRange = parseAgeRange(ageGroupData.ageRange);

                        // Eğer userRange girilmişse kesişim kontrolü yap
                        if (userRange) {
                            if (!checkRangeOverlap(userRange, guideRange)) {
                                return; // kesişmiyorsa bu aralığı gösterme
                            }
                        }

                        let status = null;
                        let adjustedTestValue = parseFloat(testValueInput);

                        if (!isNaN(adjustedTestValue)) {
                            // Girilen değer G/L cinsinden, eğer klavuz mg/L ise 1000 ile çarp
                            if (guideData.unit === 'mg/L') {

                                console.log(guideData.name,' mg/L unit test analizi');
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
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Yüksek':
                return '↑';
            case 'Düşük':
                return '↓';
            case 'Normal':
                return '→';
            default:
                return '';
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Tetkik Analizi</Text>

            <Text style={styles.label}>Tetkik Seçiniz:</Text>
            <View style={styles.testListContainer}>
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
            </View>

            <Text style={styles.label}>Yaş Aralığı (opsiyonel, örn: "0-7" veya "0-72" veya "cord"):</Text>
            <TextInput
                style={styles.input}
                value={ageRangeInput}
                onChangeText={setAgeRangeInput}
                placeholder="Yaş aralığı giriniz"
            />

            <Text style={styles.label}>Test Değeri (G/L) (opsiyonel):</Text>
            <TextInput
                style={styles.input}
                placeholder="Test değeri giriniz (G/L)"
                keyboardType="numeric"
                value={testValueInput}
                onChangeText={setTestValueInput}
            />

            <Button title="Ara" onPress={handleSearch} />

            <View style={styles.resultsContainer}>
                {results.length === 0 ? (
                    <Text style={styles.noResultText}>Arama sonucu yok.</Text>
                ) : (
                    results.map((item, index) => (
                        <View key={index} style={styles.resultItem}>
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
                                <View style={[
                                    styles.statusContainer,
                                    item.status === 'Normal' ? styles.normalBg :
                                        (item.status === 'Yüksek' ? styles.highBg : styles.lowBg)
                                ]}>
                                    <Text style={styles.statusText}>Durum: {item.status} {getStatusIcon(item.status)}</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10, backgroundColor: '#f2f2f2', flex: 1 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { marginTop: 15, fontWeight: '600', fontSize: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginTop: 5, borderRadius: 5, backgroundColor: '#fff' },
    testListContainer: { marginTop: 10, backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#ccc' },
    testTypeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    testTypeItemSelected: {
        backgroundColor: '#e6f7ff'
    },
    checkbox: { marginRight: 10, fontSize: 16 },
    testName: { fontSize: 16 },
    selected: { fontWeight: 'bold', color: '#007acc' },
    resultsContainer: { marginTop: 30 },
    noResultText: { textAlign: 'center', fontSize: 16, marginTop: 20 },
    resultItem: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    resultRow: {
        flexDirection: 'row',
        marginBottom: 5
    },
    resultLabel: {
        width: 110,
        fontWeight: '600'
    },
    resultValue: {
        flex: 1
    },
    statusContainer: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#fff'
    },
    highBg: { backgroundColor: '#ff4d4f' },   // Kırmızı ton
    normalBg: { backgroundColor: '#52c41a' }, // Yeşil ton
    lowBg: { backgroundColor: '#faad14' }     // Turuncu ton
});

export default TestAnalysisScreen;
