// src/screens/admin/guideManagement/EditTestScreen.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { getGuideById, updateTest } from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const EditTestScreen = ({ route, navigation }) => {
    const { guideId, testName } = route.params;
    const [name, setName] = useState('');

    useEffect(() => {
        fetchTest();
    }, []);

    const fetchTest = async () => {
        const guide = await getGuideById(guideId);
        if (!guide) return;

        const test = guide.testTypes.find((t) => t.name === testName);
        if (test) {
            setName(test.name);
        }
    };

    const handleUpdateTest = async () => {
        // testName -> eski ad, name -> yeni ad
        // updateTest fonksiyonunda 1.parametre guideId, 2. parametre testId (eski ad), 3. parametre ise yeni veriler
        await updateTest(guideId, testName, { name });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Tetkik Adı"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <Button mode="contained" onPress={handleUpdateTest}>
                Güncelle
            </Button>
        </View>
    );
};

export default EditTestScreen;
