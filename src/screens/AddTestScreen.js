import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker'; // Alternatif olarak DropDownPicker kullanıyoruz
import { addTest, getTests } from '../services/firebaseService';
import styles from '../styles/styles';

const AddTestScreen = ({ route, navigation }) => {
    const { guideId } = route.params;
    const [testName, setTestName] = useState(null);
    const [open, setOpen] = useState(false);
    const [existingTests, setExistingTests] = useState([]);
    const [items, setItems] = useState([
        { label: 'IgA', value: 'IgA' },
        { label: 'IgM', value: 'IgM' },
        { label: 'IgG', value: 'IgG' },
    ]);

    useEffect(() => {
        fetchExistingTests();
    }, []);

    const fetchExistingTests = async () => {
        const tests = await getTests(guideId);
        setExistingTests(tests.map((test) => test.name)); // Mevcut tetkik adlarını alıyoruz
    };

    const handleAddTest = async () => {
        if (!testName) {
            Alert.alert('Hata', 'Lütfen bir tetkik adı seçin!');
            return;
        }
        if (existingTests.includes(testName)) {
            Alert.alert('Hata', 'Bu tetkik adı zaten mevcut!');
            return;
        }

        await addTest(guideId, { name: testName });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <DropDownPicker
                open={open}
                value={testName}
                items={items}
                setOpen={setOpen}
                setValue={setTestName}
                setItems={setItems}
                placeholder="Tetkik Adı Seçin"
                style={styles.dropdown}
            />
            <Button mode="contained" onPress={handleAddTest} style={styles.button}>
                Tetkik Ekle
            </Button>
        </View>
    );
};

export default AddTestScreen;
