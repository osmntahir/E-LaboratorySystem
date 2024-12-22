// src/screens/admin/guideManagement/EditTestScreen.js
import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { getGuideById, updateTest } from '../../../services/firebaseService';
import TEST_TYPES from '../../../constants/testTypes';
import styles from '../../../styles/styles';

const EditTestScreen = ({ route, navigation }) => {
    const { guideId, testName } = route.params;
    const [selectedTest, setSelectedTest] = useState(testName);
    const [availableTests, setAvailableTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailableTests();
    }, []);

    const fetchAvailableTests = async () => {
        setLoading(true);
        try {
            const guide = await getGuideById(guideId);
            if (guide) {
                const existingTests = guide.testTypes.map(t => t.name);
                const filteredTests = TEST_TYPES.filter(
                    test => !existingTests.includes(test.name) || test.name === testName
                );
                setAvailableTests(filteredTests);
            }
        } catch (error) {
            console.error('Testleri çekerken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTest = async () => {
        if (!selectedTest) {
            Alert.alert('Hata', 'Lütfen bir tetkik adı seçin!');
            return;
        }
        await updateTest(guideId, testName, { name: selectedTest });
        navigation.goBack();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={{ marginBottom: 10 }}>Tetkik Adı</Text>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}>
                    <Picker
                        selectedValue={selectedTest}
                        onValueChange={(itemValue) => setSelectedTest(itemValue)}
                        style={styles.picker}
                        itemStyle={{ height: 50 }}
                    >
                        {availableTests.map((test) => (
                            <Picker.Item key={test.id} label={test.name} value={test.name} />
                        ))}
                    </Picker>
                </View>
                <Button mode="contained" onPress={handleUpdateTest} style={{ marginTop: 20 }}>
                    Güncelle
                </Button>
            </View>
        </ScrollView>
    );
};

export default EditTestScreen;
