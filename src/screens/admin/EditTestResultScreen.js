// src/screens/EditTestResultScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

import { calculateAgeInMonths } from '../../utils/ageCalculator';
import { isAgeInRange } from '../../utils/ageRangeEvaluator';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, TextInput, Button, Card, IconButton, Subheading } from 'react-native-paper';
import { updateTestResult } from '../../services/testResultService';

const EditTestResultScreen = ({ route, navigation }) => {
    const { testResult, patient } = route.params;

    const [testDate, setTestDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [tests, setTests] = useState([]); // Tüm test tipleri (IgA, IgM, ...)
    const [allTestTypes, setAllTestTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAllTestTypes();
    }, []);

    const fetchAllTestTypes = async () => {
        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));
            const testNameSet = new Set();
            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();
                if (Array.isArray(guideData.testTypes)) {
                    guideData.testTypes.forEach((t) => {
                        testNameSet.add(t.name);
                    });
                }
            });
            setAllTestTypes(Array.from(testNameSet));
        } catch (error) {
            console.error('Error fetching test types: ', error);
        }
    };

    // Mevcut testResult'taki testDate'i parse edip state'e aktar
    useEffect(() => {
        if (testResult) {
            const parsedDate = parseDate(testResult.testDate);
            setTestDate(parsedDate);
        }
    }, [testResult]);

    // Tüm test tipleri geldikten sonra, testResult.tests içindeki değerlerle eşleştir
    useEffect(() => {
        if (allTestTypes.length > 0 && testResult) {
            const initialTests = allTestTypes.map((testName) => {
                const existing = testResult.tests.find((t) => t.testName === testName);
                return {
                    testName,
                    testValue: existing ? existing.testValue.toString() : '',
                };
            });
            setTests(initialTests);
        }
    }, [allTestTypes, testResult]);

    const parseDate = (dateStr) => {
        const [datePart, timePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);

        let hour = 0;
        let minute = 0;

        if (timePart) {
            const [h, m] = timePart.split(':').map(Number);
            hour = h || 0;
            minute = m || 0;
        }

        return new Date(year, month - 1, day, hour, minute);
    };

    const formatDate = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const currentDate = new Date(testDate);
            currentDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setTestDate(currentDate);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const currentDate = new Date(testDate);
            currentDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
            setTestDate(currentDate);
        }
    };

    const handleTestValueChange = (testName, value) => {
        setTests((prev) =>
            prev.map((t) => (t.testName === testName ? { ...t, testValue: value } : t))
        );
    };

    const handleUpdate = async () => {
        // Değer girilmiş mi kontrol et: tüm testValue alanları boşsa uyarı
        const hasValues = tests.some((t) => t.testValue.trim() !== '');
        if (!hasValues) {
            Alert.alert('Hata', 'En az bir tetkik değeri girmelisiniz.');
            return;
        }

        setLoading(true);
        try {
            const ageInMonths = calculateAgeInMonths(patient.birthDate);

            // tests[] içinden testValue dolu olanları al, evaluate yap
            const updatedTests = [];
            for (const t of tests) {
                const tvTrim = t.testValue.trim();
                if (tvTrim === '') {
                    // eğer user bu testi boş bırakmışsa eklemiyoruz
                    continue;
                }

                const val = parseFloat(tvTrim);
                if (isNaN(val)) {
                    Alert.alert('Hata', `${t.testName} için geçerli bir sayı giriniz.`);
                    setLoading(false);
                    return;
                }

                const guideEvaluations = await evaluateTestValueAcrossGuides(t.testName, val, ageInMonths);

                updatedTests.push({
                    testName: t.testName,
                    testValue: val,
                    guideEvaluations,
                });
            }

            const formattedDate = formatDate(testDate);

            const updatedResult = {
                testDate: formattedDate,
                tests: updatedTests,
            };

            await updateTestResult(testResult.id, updatedResult);

            Alert.alert('Başarılı', 'Tahlil sonucu güncellendi.');
            setLoading(false);

            // Hasta detay ekranına geri dön
            navigation.navigate('PatientDetail', { patient });
        } catch (error) {
            console.error('Error updating test result:', error);
            Alert.alert('Hata', 'Güncelleme sırasında bir hata oluştu.');
            setLoading(false);
        }
    };

    /**
     *  KILAVUZ ŞEMASI UYGULAMASI:
     *  guides -> guideData.testTypes -> test -> ageGroups -> referenceMin/referenceMax
     */
    const evaluateTestValueAcrossGuides = async (testName, testValue, ageInMonths) => {
        const guideEvaluations = [];
        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));

            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();
                const foundTest = (guideData.testTypes || []).find((t) => t.name === testName);
                if (!foundTest) return;

                if (!Array.isArray(foundTest.ageGroups)) return;

                foundTest.ageGroups.forEach((ageGroup) => {
                    if (isAgeInRange(ageInMonths, ageGroup.ageRange)) {
                        let adjustedValue = testValue;
                        if (guideData.unit === 'mg/L') {
                            // eğer input g/L ise => mg/L çevir => adjustedValue = testValue * 1000
                            // Proje gereğine göre ekleyin
                            adjustedValue = testValue * 1000;
                        }

                        const minVal = ageGroup.referenceMin;
                        const maxVal = ageGroup.referenceMax;
                        let status = 'Normal';

                        if (adjustedValue < minVal) status = 'Düşük';
                        else if (adjustedValue > maxVal) status = 'Yüksek';

                        guideEvaluations.push({
                            guideName: guideData.name,
                            minValue: minVal,
                            maxValue: maxVal,
                            status,
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Error evaluating test value:', error);
        }
        return guideEvaluations;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text>Yeni tahlil değerleri hesaplanıyor...</Text>
                </View>
            )}
            <Card style={styles.card}>
                <Card.Title
                    title="Tahlil Sonucu Düzenle"
                    titleStyle={styles.cardTitle}
                    left={(props) => <IconButton {...props} icon="flask" />}
                />
                <Card.Content>
                    <Subheading style={styles.sectionTitle}>Tarih ve Saat</Subheading>
                    <View style={styles.dateTimeContainer}>
                        <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
                            Tarih Değiştir
                        </Button>
                        <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={styles.dateTimeButton}>
                            Saat Değiştir
                        </Button>
                    </View>
                    <Text style={styles.selectedDate}>Seçilen Tarih ve Saat: {formatDate(testDate)}</Text>

                    {showDatePicker && (
                        <DateTimePicker
                            value={testDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}
                    {showTimePicker && (
                        <DateTimePicker
                            value={testDate}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={handleTimeChange}
                        />
                    )}

                    <Subheading style={styles.sectionTitle}>Test Değerleri (Opsiyonel)</Subheading>
                    {tests.map((t, index) => (
                        <View key={index} style={styles.testTypeContainer}>
                            <Text style={styles.testName}>{t.testName}</Text>
                            <TextInput
                                mode="outlined"
                                label={`${t.testName} Değeri (Opsiyonel)`}
                                placeholder="Değer giriniz ya da boş bırakınız"
                                keyboardType="numeric"
                                value={t.testValue}
                                onChangeText={(value) => handleTestValueChange(t.testName, value)}
                                style={styles.input}
                            />
                        </View>
                    ))}

                    <Button
                        mode="contained"
                        onPress={handleUpdate}
                        style={styles.saveButton}
                        disabled={tests.every((test) => test.testValue.trim() === '')}
                    >
                        Güncelle
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f2f6ff',
        flexGrow: 1,
    },
    card: {
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '600',
        color: '#3f51b5',
    },
    dateTimeContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    dateTimeButton: {
        marginRight: 10,
    },
    selectedDate: {
        marginTop: 5,
        fontSize: 16,
        marginBottom: 20,
    },
    testTypeContainer: {
        marginBottom: 15,
    },
    testName: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        marginBottom: 10,
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 5,
        padding: 5,
        backgroundColor: '#3f51b5',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});

export default EditTestResultScreen;
