// src/screens/AddAgeGroupScreen.js
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { addAgeGroup } from '../services/firebaseService';
import styles from '../styles/styles';

const AddAgeGroupScreen = ({ route, navigation }) => {
    const { guideId, testId } = route.params;
    const [ageRange, setAgeRange] = useState('');
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');

    const handleAddAgeGroup = async () => {
        await addAgeGroup(guideId, testId, {
            ageRange,
            minValue: parseFloat(minValue),
            maxValue: parseFloat(maxValue),
        });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Yaş Aralığını ay olarak giriniz (örn: 0-5)"
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
            <Button mode="contained" onPress={handleAddAgeGroup}>
                Kaydet
            </Button>
        </View>
    );
};

export default AddAgeGroupScreen;
