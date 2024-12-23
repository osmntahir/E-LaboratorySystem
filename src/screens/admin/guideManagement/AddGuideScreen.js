// src/screens/admin/guideManagement/AddGuideScreen.js
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { addGuide } from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const AddGuideScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('mg/L');
    const [type, setType] = useState('minMax'); // Varsayılan olarak minMax

    const handleAddGuide = async () => {
        await addGuide({ name, description, unit, type });
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

            <Button mode="contained" onPress={handleAddGuide}>
                Kaydet
            </Button>
        </View>
    );
};

export default AddGuideScreen;
