// src/screens/admin/EditTestResultScreen.js
import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView , Platform } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

import { calculateAgeInMonths } from '../../utils/ageCalculator';
import { isAgeInRange } from '../../utils/ageRangeEvaluator';

import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Text,
    TextInput,
    Button,
    Card,
    IconButton,
    Subheading,
    ActivityIndicator,
    Portal,
    Modal,
} from 'react-native-paper';
import { updateTestResult } from '../../services/testResultService';

const EditTestResultScreen = ({ route, navigation }) => {
    const { testResult, patient } = route.params;

    const [testDate, setTestDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [tests, setTests] = useState([]); // Tüm test türleri (IgA, IgG vs.)
    const [allTestTypes, setAllTestTypes] = useState([]); // Rehberlerden toplanan testName'ler
    const [isLoadingModalVisible, setIsLoadingModalVisible] = useState(false);

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
                        if (t.name) {
                            testNameSet.add(t.name);
                        }
                    });
                }
            });
            setAllTestTypes(Array.from(testNameSet));
        } catch (error) {
            console.error('Error fetching test types: ', error);
        }
    };

    // Parse existing date
    useEffect(() => {
        if (testResult) {
            const parsedDate = parseDate(testResult.testDate);
            setTestDate(parsedDate);
        }
    }, [testResult]);

    // Initialize test values
    useEffect(() => {
        if (allTestTypes.length > 0 && testResult) {
            const existingMap = {};
            (testResult.tests || []).forEach((t) => {
                existingMap[t.testName] = t.testValue.toString();
            });

            const initialTests = allTestTypes.map((testName) => ({
                testName,
                testValue: existingMap[testName] || '',
            }));
            setTests(initialTests);
        }
    }, [allTestTypes, testResult]);

    const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') {
            console.error('Invalid date string:', dateStr);
            return new Date(0);
        }
        const [datePart, timePart] = dateStr.split(' ');
        if (!datePart) {
            console.error('Invalid date format:', dateStr);
            return new Date(0);
        }

        const [year, month, day] = datePart.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            console.error('Invalid date numbers:', dateStr);
            return new Date(0);
        }

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
        const hasValues = tests.some((t) => t.testValue.trim() !== '');
        if (!hasValues) {
            Alert.alert('Hata', 'En az bir tetkik değeri girmelisiniz.');
            return;
        }

        setIsLoadingModalVisible(true);
        try {
            const ageInMonths = calculateAgeInMonths(patient.birthDate);

            const updatedTests = [];
            for (const t of tests) {
                const trimmedVal = t.testValue.trim();
                if (trimmedVal === '') {
                    // Skip empty tests
                    continue;
                }

                const val = parseFloat(trimmedVal);
                if (isNaN(val)) {
                    Alert.alert('Hata', `${t.testName} için geçerli bir sayı giriniz.`);
                    setIsLoadingModalVisible(false);
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
            setIsLoadingModalVisible(false);

            navigation.navigate('PatientDetail', { patient });
        } catch (error) {
            console.error('Error updating test result:', error);
            Alert.alert('Hata', 'Güncelleme sırasında bir hata oluştu.');
            setIsLoadingModalVisible(false);
        }
    };

    const evaluateTestValueAcrossGuides = async (testName, testValue, ageInMonths) => {
        const guideEvaluations = [];
        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));

            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();
                // testTypes array check
                if (!Array.isArray(guideData.testTypes)) return;

                const foundTest = guideData.testTypes.find((t) => t.name === testName);
                if (!foundTest) return;

                if (!Array.isArray(foundTest.ageGroups)) return;

                foundTest.ageGroups.forEach((ageGroup) => {
                    if (isAgeInRange(ageInMonths, ageGroup.ageRange)) {
                        let adjustedValue = testValue;
                        if (guideData.unit === 'mg/L') {
                            adjustedValue = testValue * 1000;
                        }

                        const minVal = ageGroup.referenceMin;
                        const maxVal = ageGroup.referenceMax;
                        let status = 'Normal';

                        if (adjustedValue < minVal) status = 'Düşük';
                        else if (adjustedValue > maxVal) status = 'Yüksek';

                        guideEvaluations.push({
                            guideName: guideData.name || 'N/A',
                            unit: guideData.unit || 'N/A',
                            type: guideData.type || 'N/A',
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
        <View style={styles.container}>
            <Portal>
                <Modal visible={isLoadingModalVisible} dismissable={false}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} size="large" color="#3f51b5" />
                        <Text style={styles.loadingText}>Test sonuçları hesaplanıyor...</Text>
                    </View>
                </Modal>
            </Portal>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.card}>
                    <Card.Title
                        title={<Text style={styles.cardTitle}>Tahlil Sonucu Düzenle</Text>}
                        left={(props) => <IconButton {...props} icon="flask" />}
                    />
                    <Card.Content>
                        <Subheading style={styles.sectionTitle}>Tarih ve Saat Seçimi</Subheading>
                        <View style={styles.dateTimeContainer}>
                            <Button
                                mode="outlined"
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateTimeButton}
                            >
                                Tarih Değiştir
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => setShowTimePicker(true)}
                                style={styles.dateTimeButton}
                            >
                                Saat Değiştir
                            </Button>
                        </View>
                        <Text style={styles.selectedDate}>
                            Seçilen Tarih ve Saat: {formatDate(testDate)}
                        </Text>

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


                        {tests.map((t, index) => (
                            <View key={index} style={styles.testTypeContainer}>
                                <Text style={styles.testName}>{t.testName}</Text>
                                <TextInput
                                    mode="outlined"
                                    label={`${t.testName} Değeri (g/L)`}
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
                        >
                            Güncelle
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
};

export default EditTestResultScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
    },
    scrollContent: {
        padding: 10,
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
        justifyContent: 'flex-start',
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
    loadingContainer: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#fff',
    },
});
