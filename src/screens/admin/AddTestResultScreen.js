// src/screens/admin/AddTestResultScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { db } from '../../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { addTestResult } from '../../services/testResultService';
import { calculateAgeInMonths } from '../../utils/ageCalculator';
import { isAgeInRange } from '../../utils/ageRangeEvaluator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, TextInput, Button, Card, IconButton, Subheading, ActivityIndicator, Portal, Modal } from 'react-native-paper';

const AddTestResultScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [testTypes, setTestTypes] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [testValues, setTestValues] = useState({});

    const [testDate, setTestDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // 1) Tüm kılavuzları al, içindeki testTypes'ları toplayıp testTypes'e at.
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

    const toggleTestSelection = (testName) => {
        if (selectedTests.includes(testName)) {
            setSelectedTests(selectedTests.filter((name) => name !== testName));
            const newTestValues = { ...testValues };
            delete newTestValues[testName];
            setTestValues(newTestValues);
        } else {
            setSelectedTests([...selectedTests, testName]);
        }
    };

    const handleValueChange = (testName, value) => {
        setTestValues({ ...testValues, [testName]: value });
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

    // 2) "Kaydet" butonuna basıldığında
    const handleSave = async () => {
        if (selectedTests.length === 0 || selectedTests.every((tn) => !testValues[tn] || testValues[tn].trim() === '')) {
            Alert.alert('Uyarı', 'En az bir tahlil seçimi yapıp geçerli bir değer giriniz.');
            return;
        }

        try {
            setIsLoading(true);
            const ageInMonths = calculateAgeInMonths(patient.birthDate);

            // Her test için testValue al, sonra evaluateTestValueAcrossGuides ile rehber kontrolü yap.
            const tests = [];
            for (const testName of selectedTests) {
                const testValue = parseFloat(testValues[testName]);
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

    // 3) Kılavuz Şemasına Göre Değer Kontrol Fonksiyonu
    const evaluateTestValueAcrossGuides = async (testName, testValue, ageInMonths) => {
        const guideEvaluations = [];
        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));

            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();
                // Her guide'da testTypes array var.
                const foundTest = (guideData.testTypes || []).find((t) => t.name === testName);
                if (!foundTest) return; // Bu guide'da ilgili test yoksa geç

                // Her testin ageGroups dizisini gez
                if (!Array.isArray(foundTest.ageGroups)) return;

                foundTest.ageGroups.forEach((ageGroup) => {
                    // ageGroup.ageRange => "0-1", "2-5", ...
                    if (isAgeInRange(ageInMonths, ageGroup.ageRange)) {
                        let adjustedValue = testValue;
                        // unit kontrolü
                        if (guideData.unit === 'mg/L') {
                            // Giriş değeri g/L ise mg/L'ye çevirmek için 1000 ile çarp
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

                        <Subheading style={styles.sectionTitle}>Testler</Subheading>
                        {testTypes.map((testName, index) => (
                            <View key={index} style={styles.testTypeContainer}>
                                <TouchableOpacity onPress={() => toggleTestSelection(testName)}>
                                    <Text style={styles.testName}>
                                        {selectedTests.includes(testName) ? '☑ ' : '☐ '}
                                        {testName}
                                    </Text>
                                </TouchableOpacity>
                                {selectedTests.includes(testName) && (
                                    <TextInput
                                        mode="outlined"
                                        label={`${testName} Değeri (g/L)`}
                                        placeholder="Değer giriniz"
                                        keyboardType="numeric"
                                        value={testValues[testName] || ''}
                                        onChangeText={(value) => handleValueChange(testName, value)}
                                        style={styles.input}
                                    />
                                )}
                            </View>
                        ))}

                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={styles.saveButton}
                            disabled={
                                selectedTests.length === 0 ||
                                selectedTests.every((testName) => !testValues[testName] || testValues[testName].trim() === '')
                            }
                        >
                            Kaydet
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );

};

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

export default AddTestResultScreen;
