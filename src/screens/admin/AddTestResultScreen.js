// src/screens/AddTestResultScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { db } from '../../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { addTestResult } from '../../services/testResultService';
import { calculateAgeInMonths } from '../../utils/ageCalculator';
import { isAgeInRange } from '../../utils/ageRangeEvaluator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, TextInput, Button, Card, Title, IconButton, Subheading } from 'react-native-paper';

const AddTestResultScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [testTypes, setTestTypes] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [testValues, setTestValues] = useState({});

    // Tarih ve saat seçimi için state
    const [testDate, setTestDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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

                setTestTypes(Array.from(testTypeSet));
            } catch (error) {
                console.error('Error fetching test types: ', error);
            }
        };

        fetchTestTypes();
    }, []);

    const toggleTestSelection = (testName) => {
        if (selectedTests.includes(testName)) {
            setSelectedTests(selectedTests.filter(name => name !== testName));
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

        // Format: YYYY-MM-DD HH:mm:ss
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const handleSave = async () => {
        try {
            const ageInMonths = calculateAgeInMonths(patient.birthDate);

            const tests = [];
            for (const testName of selectedTests) {
                const testValue = parseFloat(testValues[testName]);
                if (isNaN(testValue)) {
                    alert(`${testName} için geçerli bir değer giriniz.`);
                    return;
                }

                const guideEvaluations = await evaluateTestValueAcrossGuides(testName, testValue, ageInMonths);

                tests.push({
                    testName,
                    testValue,
                    guideEvaluations
                });
            }

            // Tarihi anlaşılır bir formatta kaydediyoruz
            const formattedDate = formatDate(testDate);

            const testResult = {
                patientTc: patient.tcNo,
                testDate: formattedDate,  // Daha okunaklı format
                tests
            };

            await addTestResult(testResult);

            alert('Test sonuçları başarıyla kaydedildi.');
            navigation.goBack();
        } catch (error) {
            console.error('Error saving test result: ', error);
        }
    };

    const evaluateTestValueAcrossGuides = async (testName, testValue, ageInMonths) => {
        const guideEvaluations = [];
        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));
            for (const guideDoc of guidesSnapshot.docs) {
                const guideData = guideDoc.data();
                const testsSnapshot = await getDocs(collection(db, 'guides', guideDoc.id, 'tests'));
                let foundTest = null;

                testsSnapshot.forEach(testDoc => {
                    if (testDoc.data().name === testName) {
                        foundTest = testDoc;
                    }
                });

                if (foundTest) {
                    const ageGroupsSnapshot = await getDocs(collection(db, 'guides', guideDoc.id, 'tests', foundTest.id, 'ageGroups'));
                    ageGroupsSnapshot.forEach(ageGroupDoc => {
                        const ageGroupData = ageGroupDoc.data();
                        if (isAgeInRange(ageInMonths, ageGroupData.ageRange)) {
                            let adjustedTestValue = testValue;

                            // Eğer birim mg/L ise değeri 1000 ile çarp
                            if (guideData.unit === 'mg/L') {
                                adjustedTestValue *= 1000;
                            }

                            const minValue = ageGroupData.minValue;
                            const maxValue = ageGroupData.maxValue;
                            let status = 'Normal';

                            if (adjustedTestValue < minValue) status = 'Düşük';
                            else if (adjustedTestValue > maxValue) status = 'Yüksek';

                            guideEvaluations.push({
                                guideName: guideData.name,
                                minValue,
                                maxValue,
                                status
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error evaluating test value: ', error);
        }
        return guideEvaluations;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Title
                    title="Test Ekle"
                    titleStyle={styles.cardTitle}
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
                            <TouchableOpacity onPress={() => toggleTestSelection(testName)}>
                                <Text style={styles.testName}>
                                    {selectedTests.includes(testName) ? '☑ ' : '☐ '}
                                    {testName}
                                </Text>
                            </TouchableOpacity>
                            {selectedTests.includes(testName) && (
                                <TextInput
                                    mode="outlined"
                                    label={`${testName} Değeri`}
                                    placeholder="Değer giriniz"
                                    keyboardType="numeric"
                                    value={testValues[testName] || ''}
                                    onChangeText={(value) => handleValueChange(testName, value)}
                                    style={styles.input}
                                />
                            )}
                        </View>
                    ))}

                    <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                        Kaydet
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
        flexGrow: 1
    },
    card: {
        borderRadius: 10
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3f51b5'
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
        marginBottom: 10
    },
    dateTimeButton: {
        marginRight: 10
    },
    selectedDate: {
        marginTop: 5,
        fontSize: 16,
        marginBottom: 20
    },
    testTypeContainer: {
        marginBottom: 15
    },
    testName: {
        fontSize: 16,
        marginBottom: 5
    },
    input: {
        marginBottom: 10
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 5,
        padding: 5,
        backgroundColor: '#3f51b5'
    }
});

export default AddTestResultScreen;
