// src/screens/admin/GuideManagementScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Button, IconButton, Text, List } from 'react-native-paper';
import { getAllGuides, deleteGuide } from '../../services/firebaseService';
import styles from '../../styles/styles';

const GuideManagementScreen = ({ navigation }) => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchGuides();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchGuides = async () => {
        setLoading(true);
        try {
            const guideList = await getAllGuides();
            setGuides(guideList);
        } catch (error) {
            console.error('Kılavuzları çekerken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGuide = async (guideId) => {
        Alert.alert(
            'Silme Onayı',
            'Bu kılavuzu silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Evet',
                    onPress: async () => {
                        await deleteGuide(guideId);
                        fetchGuides();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const renderGuides = () => {
        if (loading) {
            return <Text style={styles.loadingText}>Yükleniyor...</Text>;
        }

        if (guides.length === 0) {
            return (
                <Text style={styles.noDataText}>
                    Henüz kılavuz bulunmamaktadır. Yeni bir kılavuz ekleyebilirsiniz.
                </Text>
            );
        }

        return guides.map((guide) => (
            <List.Item
                key={guide.id}
                title={guide.name}
                description={`Birim: ${guide.unit} | Tip: ${guide.type}`}
                onPress={() => navigation.navigate('GuideDetail', { guideId: guide.id })}
                right={() => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() =>
                                navigation.navigate('EditGuide', { guideId: guide.id })
                            }
                        />
                        <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDeleteGuide(guide.id)}
                        />
                    </View>
                )}
            />
        ));
    };

    return (
        <View style={styles.container}>
            {/* Üst Butonlar */}
            <View style={styles.topButtonContainer}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('AddGuide')}
                    style={styles.addGuideButton}
                >
                    Yeni Kılavuz Ekle
                </Button>
                <IconButton
                    icon="upload"
                    size={24}
                    onPress={() =>
                        Alert.alert(
                            'JSON Yükleme',
                            'JSON verilerini yüklemek istediğinize emin misiniz?',
                            [
                                { text: 'İptal', style: 'cancel' },
                                {
                                    text: 'Evet',
                                    onPress: () => navigation.navigate('UploadJSON'),
                                },
                            ],
                            { cancelable: false }
                        )
                    }
                    style={styles.uploadButton}
                />
            </View>

            {/* Kılavuz Listesi */}
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {renderGuides()}
            </ScrollView>
        </View>
    );
};

export default GuideManagementScreen;
