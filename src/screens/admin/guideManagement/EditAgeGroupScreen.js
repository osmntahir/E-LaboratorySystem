// src/screens/admin/guideManagement/EditAgeGroupScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import {
    getGuideById,
    updateAgeGroup,
} from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const EditAgeGroupScreen = ({ route, navigation }) => {
    const { guideId, testName, ageGroupIndex } = route.params;

    const [guideType, setGuideType] = useState('');

    // Ortak
    const [ageRange, setAgeRange] = useState('');

    // minMax
    const [minValue, setMinValue] = useState('');
    const [maxValue, setMaxValue] = useState('');

    // geometric
    const [geometricMean, setGeometricMean] = useState('');
    const [standardDeviation, setStandardDeviation] = useState('');

    useEffect(() => {
        fetchAgeGroup();
    }, []);

    const fetchAgeGroup = async () => {
        const guide = await getGuideById(guideId);
        if (!guide) return;
        setGuideType(guide.type);

        const test = guide.testTypes.find((t) => t.name === testName);
        if (!test) return;

        const ageGroup = test.ageGroups[ageGroupIndex];
        if (!ageGroup) return;

        setAgeRange(ageGroup.ageRange || '');

        if (guide.type === 'minMax') {
            setMinValue(ageGroup.minValue?.toString() || '');
            setMaxValue(ageGroup.maxValue?.toString() || '');
        } else if (guide.type === 'geometric') {
            setGeometricMean(ageGroup.geometricMean?.toString() || '');
            setStandardDeviation(ageGroup.standardDeviation?.toString() || '');
        }
    };

    const handleUpdateAgeGroup = async () => {
        const ageGroupData = { ageRange };

        if (guideType === 'minMax') {
            ageGroupData.minValue = minValue;
            ageGroupData.maxValue = maxValue;
        } else if (guideType === 'geometric') {
            ageGroupData.geometricMean = geometricMean;
            ageGroupData.standardDeviation = standardDeviation;
        }

        await updateAgeGroup(guideId, testName, ageGroupIndex, ageGroupData);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Yaş Grubu Düzenle (Tip: {guideType})</Text>

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

            <Button mode="contained" onPress={handleUpdateAgeGroup}>
                Güncelle
            </Button>
        </View>
    );
};

export default EditAgeGroupScreen;
