// src/screens/EditAgeGroupScreen.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { updateAgeGroup } from '../services/firebaseService';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../styles/styles';

const EditAgeGroupScreen = ({ route, navigation }) => {
    const { guideId, testId, ageGroupId } = route.params;
    const [ageRange, setAgeRange] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');

    useEffect(() => {
        fetchAgeGroup();
    }, []);

    const fetchAgeGroup = async () => {
        const ageGroupRef = doc(
            db,
            'guides',
            guideId,
            'tests',
            testId,
            'ageGroups',
            ageGroupId
        );
        const docSnap = await getDoc(ageGroupRef);
        if (docSnap.exists()) {
            const ageGroup = docSnap.data();
            setAgeRange(ageGroup.ageRange);
            setMinValue(ageGroup.minValue.toString());
            setMaxValue(ageGroup.maxValue.toString());
        } else {
            console.log('Belge bulunamadı!');
        }
    };

    const handleUpdateAgeGroup = async () => {
        await updateAgeGroup(guideId, testId, ageGroupId, {
            ageRange,
            minValue: parseFloat(minValue),
            maxValue: parseFloat(maxValue),
        });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Yaş Aralığı (örn: 0-5)"
                value={ageRange}
                onChangeText={setAgeRange}
                style={styles.input}
            />
            <TextInput
                label="Min Değer"
                value={minValue}
                onChangeText={setMinValue}
                keyboardType="numeric"
                style={styles.input}
            />
            <TextInput
                label="Max Değer"
                value={maxValue}
                onChangeText={setMaxValue}
                keyboardType="numeric"
                style={styles.input}
            />
            <Button mode="contained" onPress={handleUpdateAgeGroup}>
                Güncelle
            </Button>
        </View>
    );
};

export default EditAgeGroupScreen;
