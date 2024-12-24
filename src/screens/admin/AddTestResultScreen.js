// src/screens/admin/AddTestResultScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Platform,
    Alert
} from 'react-native';
import { db } from '../../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

import { addTestResult } from '../../services/testResultService';
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
    Modal
} from 'react-native-paper';

const AddTestResultScreen = ({ route, navigation }) => {
    const { patient } = route.params;

    const [testTypes, setTestTypes] = useState([]);   // Tüm test isimleri
    const [testValues, setTestValues] = useState({}); // { testName: "değer(string)" }

    const [testDate, setTestDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // 1) Tüm klavuzları al, içindeki testTypes'ları toplayıp `testTypes` state'ine at.
    useEffect(() => {
        const fetchTestTypes = async () => {
            try {
                const guidesSnapshot = await getDocs(collection(db, 'guides'));
                // Tüm kılavuzlardan testTypes listele
                const testNameSet = new Set();

                guidesSnapshot.forEach((guideDoc) => {
                    const guideData = guideDoc.data();
                    if (Array.isArray(guideData.testTypes)) {
                        guideData.testTypes.forEach((t) => {
                            testNameSet.add(t.name);
                        });
                    }
                });
                setTestTypes(Array.from(testNameSet));
            } catch (error) {
                console.error('Error fetching test types: ', error);
            }
        };
        fetchTestTypes();
    }, []);

    const handleValueChange = (testName, value) => {
        setTestValues((prev) => ({ ...prev, [testName]: value }));
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const currentDate = new Date(testDate);
            currentDate.setFullYear(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
            );
            setTestDate(currentDate);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const currentDate = new Date(testDate);
            currentDate.setHours(selectedTime.getHours());
            currentDate.setMinutes(selectedTime.getMinutes());
            setTestDate(currentDate);
        }
    };

    const formatDate = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // Kaydet (2)
    const handleSave = async () => {
        // Filtrele: gerçekten değer girilen testleri al
        const filledTests = Object.keys(testValues).filter(
            (testName) => testValues[testName] && testValues[testName].trim() !== ''
        );

        if (filledTests.length === 0) {
            Alert.alert('Uyarı', 'En az bir tahlil için geçerli bir değer giriniz.');
            return;
        }

        try {
            setIsLoading(true);
            const ageInMonths = calculateAgeInMonths(patient.birthDate);

            // Her test için testValue al, sonra rehber kontrolü yap.
            const tests = [];
            for (const testName of filledTests) {
                const valueStr = testValues[testName];
                const testValue = parseFloat(valueStr);
                if (isNaN(testValue)) {
                    Alert.alert('Hata', `${testName} için geçerli bir sayı giriniz.`);
                    setIsLoading(false);
                    return;
                }

                const guideEvaluations = await evaluateTestValueAcrossGuides(testName, testValue, ageInMonths);
                tests.push({
                    testName,
                    testValue,
                    guideEvaluations,
                });
            }

            const formattedDate = formatDate(testDate);

            const testResult = {
                patientTc: patient.tcNo,
                testDate: formattedDate,
                tests,
            };

            await addTestResult(testResult);
            Alert.alert('Başarılı', 'Test sonuçları başarıyla kaydedildi.');
            navigation.goBack();
        } catch (error) {
            console.error('Error saving test result: ', error);
            Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    // (3) Rehber Tarama (Dinamik)
    const evaluateTestValueAcrossGuides = async (testName, testValue, ageInMonths) => {
        const guideEvaluations = [];
        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));

            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();
                console.log('evaluateTestValueAcrossGuides -> GuideDoc ID:', guideDoc.id, 'Data:', guideData);

                // Her guide'da testTypes array var.
                const foundTest = (guideData.testTypes || []).find((t) => t.name === testName);
                if (!foundTest) {
                    return;
                }


                if (!Array.isArray(foundTest.ageGroups)) return;

                foundTest.ageGroups.forEach((ageGroup) => {
                    if (isAgeInRange(ageInMonths, ageGroup.ageRange)) {
                        let adjustedValue = testValue;
                        // Unit kontrolü
                        if (guideData.unit === 'mg/L') {
                            adjustedValue *= 1000;
                        }

                        const minVal = ageGroup.referenceMin;
                        const maxVal = ageGroup.referenceMax;
                        let status = 'Normal';

                        if (adjustedValue < minVal) status = 'Düşük';
                        else if (adjustedValue > maxVal) status = 'Yüksek';

                        guideEvaluations.push({
                            guideName: guideData.name,
                            unit: guideData.unit,
                            type: guideData.type,
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
                <Modal visible={isLoading} dismissable={false}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} size="large" color="#3f51b5" />
                        <Text style={styles.loadingText}>Test sonuçları hesaplanıyor...</Text>
                    </View>
                </Modal>
            </Portal>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.card}>
                    <Card.Title
                        title={<Text style={styles.cardTitle}>Test Ekle</Text>}
                        left={(props) => <IconButton {...props} icon="flask" />}
                    />
                    <Card.Content>
                        <Subheading style={styles.sectionTitle}>Tarih ve Saat Seçimi</Subheading>
                        <View style={styles.dateTimeContainer}>
                            <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
                                Tarih Seç
                            </Button>
                            <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={styles.dateTimeButton}>
                                Saat Seç
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

                        <Subheading style={styles.sectionTitle}>Testler</Subheading>
                        {testTypes.map((testName, index) => (
                            <View key={index} style={styles.testTypeContainer}>
                                <Text style={styles.testName}>{testName}</Text>
                                <TextInput
                                    mode="outlined"
                                    label={`${testName} Değeri (g/L)`}
                                    placeholder="Değer giriniz"
                                    keyboardType="numeric"
                                    value={testValues[testName] || ''}
                                    onChangeText={(value) => handleValueChange(testName, value)}
                                    style={styles.input}
                                />
                            </View>
                        ))}

                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={styles.saveButton}
                        >
                            Kaydet
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
};

export default AddTestResultScreen;

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
