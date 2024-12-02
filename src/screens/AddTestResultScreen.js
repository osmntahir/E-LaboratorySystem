// src/screens/AddTestResultScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { addTestResult } from '../services/testResultService';
import { calculateAgeInMonths } from '../utils/ageCalculator';
import { isAgeInRange } from '../utils/ageRangeEvaluator';

const AddTestResultScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [testTypes, setTestTypes] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [testValues, setTestValues] = useState({});

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

            const testResult = {
                patientTc: patient.tcNo,
                testDate: new Date().toISOString().split('T')[0],
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
                            const minValue = ageGroupData.minValue;
                            const maxValue = ageGroupData.maxValue;
                            let status = 'Normal';

                            if (testValue < minValue) status = 'Düşük';
                            else if (testValue > maxValue) status = 'Yüksek';

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
            <Text style={styles.title}>Test Ekle</Text>
            {testTypes.map((testName, index) => (
                <View key={index} style={styles.testTypeContainer}>
                    <TouchableOpacity onPress={() => toggleTestSelection(testName)}>
                        <Text style={styles.testName}>{testName}</Text>
                    </TouchableOpacity>
                    {selectedTests.includes(testName) && (
                        <TextInput
                            style={styles.input}
                            placeholder="Değer"
                            keyboardType="numeric"
                            onChangeText={(value) => handleValueChange(testName, value)}
                        />
                    )}
                </View>
            ))}
            <Button title="Kaydet" onPress={handleSave} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 10 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    testTypeContainer: { marginBottom: 10 },
    testName: { fontSize: 16 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 5, marginTop: 5 }
});

export default AddTestResultScreen;
