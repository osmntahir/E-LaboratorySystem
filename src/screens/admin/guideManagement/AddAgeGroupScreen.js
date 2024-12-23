// src/screens/admin/guideManagement/AddAgeGroupScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { getGuideById, addAgeGroup } from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const AddAgeGroupScreen = ({ route, navigation }) => {
    const { guideId, testName } = route.params;

    // Kılavuz tipi
    const [guideType, setGuideType] = useState('');

    // Ortak alan
    const [ageRange, setAgeRange] = useState('');

    // minMax için
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');

    // geometric için
    const [geometricMean, setGeometricMean] = useState('');
    const [standardDeviation, setStandardDeviation] = useState('');

    useEffect(() => {
        fetchGuideType();
    }, []);

    const fetchGuideType = async () => {
        const guide = await getGuideById(guideId);
        if (guide) {
            setGuideType(guide.type);
        }
    };

    const handleAddAgeGroup = async () => {
        const ageGroupData = {
            ageRange,
        };

        if (guideType === 'minMax') {
            ageGroupData.minValue = minValue;
            ageGroupData.maxValue = maxValue;
        } else if (guideType === 'geometric') {
            ageGroupData.geometricMean = geometricMean;
            ageGroupData.standardDeviation = standardDeviation;
        }

        await addAgeGroup(guideId, testName, ageGroupData);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Yaş Grubu Ekle (Tip: {guideType})</Text>

            <TextInput
                label="Yaş Aralığı (örn: 0-5)"
                value={ageRange}
                onChangeText={setAgeRange}
                style={styles.input}
            />

            {guideType === 'minMax' && (
                <>
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
                </>
            )}

            {guideType === 'geometric' && (
                <>
                    <TextInput
                        label="Geometrik Ortalama (geometricMean)"
                        value={geometricMean}
                        onChangeText={setGeometricMean}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <TextInput
                        label="Standart Sapma (standardDeviation)"
                        value={standardDeviation}
                        onChangeText={setStandardDeviation}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </>
            )}

            <Button mode="contained" onPress={handleAddAgeGroup}>
                Kaydet
            </Button>
        </View>
    );
};

export default AddAgeGroupScreen;
