import React from 'react';
import { View, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import JSONUploader from '../services/JSONUploader';
import styles from '../styles/styles';

const UploadJSONScreen = () => {
    const handleUpload = async () => {
        try {
            await JSONUploader.uploadGuides(); // JSON'dan yükleme işlemini başlat
            Alert.alert('Başarılı', 'JSON verileri başarıyla yüklendi!');
        } catch (error) {
            Alert.alert('Hata', 'JSON yükleme sırasında bir hata oluştu.');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Button mode="contained" onPress={handleUpload}>
                JSON Verilerini Yükle
            </Button>
        </View>
    );
};

export default UploadJSONScreen;
