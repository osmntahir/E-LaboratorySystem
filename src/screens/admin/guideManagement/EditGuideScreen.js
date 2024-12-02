// src/screens/EditGuideScreen.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker'; // Picker bileşenini ekliyoruz
import { updateGuide } from '../../../services/firebaseService';
import { db } from '../../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../../styles/styles';

const EditGuideScreen = ({ route, navigation }) => {
    const { guideId } = route.params;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('g/L'); // Varsayılan değer 'g/L'

    useEffect(() => {
        fetchGuide();
    }, []);

    const fetchGuide = async () => {
        const guideRef = doc(db, 'guides', guideId);
        const docSnap = await getDoc(guideRef);
        if (docSnap.exists()) {
            const guide = docSnap.data();
            setName(guide.name);
            setDescription(guide.description);
            setUnit(guide.unit || 'g/L'); // Eğer unit yoksa varsayılan 'g/L'
        } else {
            console.log('Belge bulunamadı!');
        }
    };

    const handleUpdateGuide = async () => {
        await updateGuide(guideId, { name, description, unit });
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
            <Button mode="contained" onPress={handleUpdateGuide}>
                Güncelle
            </Button>
        </View>
    );
};

export default EditGuideScreen;
