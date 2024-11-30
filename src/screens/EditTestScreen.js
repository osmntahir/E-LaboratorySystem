// src/screens/EditTestScreen.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { updateTest } from '../services/firebaseService';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../styles/styles';

const EditTestScreen = ({ route, navigation }) => {
    const { guideId, testId } = route.params;
    const [name, setName] = useState('');

    useEffect(() => {
        fetchTest();
    }, []);

    const fetchTest = async () => {
        const testRef = doc(db, 'guides', guideId, 'tests', testId);
        const docSnap = await getDoc(testRef);
        if (docSnap.exists()) {
            const test = docSnap.data();
            setName(test.name);
        } else {
            console.log('Belge bulunamadı!');
        }
    };

    const handleUpdateTest = async () => {
        await updateTest(guideId, testId, { name });
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
