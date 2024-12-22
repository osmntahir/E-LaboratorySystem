import React, { useState } from 'react';
import { View, Modal, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import JSONUploader from '../services/JSONUploader';
import styles from '../styles/styles';

const UploadJSONScreen = () => {
    const [isLoading, setIsLoading] = useState(false); // Yükleme durumunu takip eder

    const handleUpload = async () => {
        setIsLoading(true); // Yükleme başlıyor
        try {
            await JSONUploader.uploadGuidesToFirestore(); // JSON'dan yükleme işlemini başlat
            Alert.alert('Başarılı', 'JSON verileri başarıyla yüklendi!');
        } catch (error) {
            Alert.alert('Hata', 'JSON yükleme sırasında bir hata oluştu.');
            console.error(error);
        } finally {
            setIsLoading(false); // Yükleme tamamlandı
        }
    };

    return (
        <View style={styles.container}>
            <Button mode="contained" onPress={handleUpload}>
                JSON Verilerini Yükle
            </Button>

            {/* Yükleme sırasında gösterilecek Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isLoading}
                onRequestClose={() => {
                    // Geri tuşunu devre dışı bırakmak için boş bırakıldı
                }}
            >
                <View style={modalStyles.modalContainer}>
                    <View style={modalStyles.modalContent}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={modalStyles.loadingText}>Yükleniyor...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Şeffaf siyah arka plan
    },
    modalContent: {
        padding: 20,
        backgroundColor: '#333',
        borderRadius: 10,
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
});

export default UploadJSONScreen;
