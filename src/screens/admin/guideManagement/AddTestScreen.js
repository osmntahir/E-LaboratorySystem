// src/screens/admin/guideManagement/AddTestScreen.js
import React, { useState, useEffect } from 'react';
import { View, Alert, Text } from 'react-native';
import { Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { addTest, getGuideById } from '../../../services/firebaseService';
import TEST_TYPES from '../../../constants/testTypes'; // Sabit test tipleri
import styles from '../../../styles/styles';

const AddTestScreen = ({ route, navigation }) => {
    const { guideId } = route.params;
    const [testName, setTestName] = useState(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [existingTests, setExistingTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExistingTests();
    }, []);

    const fetchExistingTests = async () => {
        try {
            const guide = await getGuideById(guideId);
            if (guide && guide.testTypes) {
                setExistingTests(guide.testTypes.map((t) => t.name));
            }
        } catch (error) {
            console.error('Testleri çekerken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Kullanılabilir testleri hesapla.
     * TEST_TYPES içinde olup, existingTests içinde olmayanlar.
     */
    const getAvailableTests = () => {
        return TEST_TYPES.filter((testType) => !existingTests.includes(testType.name));
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

        try {
            await addTest(guideId, { name: testName });
            Alert.alert('Başarılı', 'Tetkik başarıyla eklendi!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Hata', 'Tetkik eklenirken bir hata oluştu.');
            console.error(error);
        }
    };

    // Ekranda gösterilecek içerik:
    const renderContent = () => {
        if (loading) {
            return <Text style={styles.loadingText}>Yükleniyor...</Text>;
        }

        const availableTests = getAvailableTests();
        if (availableTests.length === 0) {
            return (
                <Text style={styles.noDataText}>
                    Tüm test tipleri zaten eklendi!
                </Text>
            );
        }

        // DropDownPicker için formatlama
        const dropDownItems = availableTests.map((testType) => ({
            label: testType.name,
            value: testType.name,
        }));

        return (
            <>
                <DropDownPicker
                    open={open}
                    value={testName}
                    items={dropDownItems}
                    setOpen={setOpen}
                    setValue={setTestName}
                    setItems={setItems}
                    placeholder="Tetkik Adı Seçin"
                    style={styles.dropdown}
                    containerStyle={{ marginBottom: 20 }}
                />
                <Button mode="contained" onPress={handleAddTest} style={styles.button}>
                    Tetkik Ekle
                </Button>
            </>
        );
    };

    return <View style={styles.container}>{renderContent()}</View>;
};

export default AddTestScreen;
