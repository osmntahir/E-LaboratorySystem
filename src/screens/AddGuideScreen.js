// src/screens/AddGuideScreen.js
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker'; // Picker bileşenini ekliyoruz
import { addGuide } from '../services/firebaseService';
import styles from '../styles/styles';

const AddGuideScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('g/L'); // Varsayılan değer 'g/L'

    const handleAddGuide = async () => {
        await addGuide({ name, description, unit });
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
                style={styles.picker} // Stil uyguluyoruz
            >
                <Picker.Item label="mg/L" value="mg/L" />
                <Picker.Item label="g/L" value="g/L" />
            </Picker>
            <Button mode="contained" onPress={handleAddGuide}>
                Kaydet
            </Button>
        </View>
    );
};

export default AddGuideScreen;
