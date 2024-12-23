// src/screens/admin/guideManagement/EditGuideScreen.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { getGuideById, updateGuide } from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const EditGuideScreen = ({ route, navigation }) => {
    const { guideId } = route.params;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('mg/L');
    const [type, setType] = useState('minMax');

    useEffect(() => {
        fetchGuide();
    }, []);

    const fetchGuide = async () => {
        const guide = await getGuideById(guideId);
        if (guide) {
            setName(guide.name);
            setDescription(guide.description);
            setUnit(guide.unit || 'mg/L');
            setType(guide.type || 'minMax');
        }
    };

    const handleUpdateGuide = async () => {
        await updateGuide(guideId, { name, description, unit, type });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Kılavuz Adı"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                label="Açıklama"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
            />
            <Picker
                selectedValue={unit}
                onValueChange={(itemValue) => setUnit(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="mg/L" value="mg/L" />
                <Picker.Item label="g/L" value="g/L" />
            </Picker>
            <Picker
                selectedValue={type}
                onValueChange={(itemValue) => setType(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="minMax" value="minMax" />
                <Picker.Item label="geometric" value="geometric" />
            </Picker>
            <Button mode="contained" onPress={handleUpdateGuide}>
                Güncelle
            </Button>
        </View>
    );
};

export default EditGuideScreen;
