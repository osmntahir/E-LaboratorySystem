import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper'; // IconButton eklendi
import { getGuides, deleteGuide } from '../services/firebaseService';
import GuideItem from '../components/GuideItem';
import styles from '../styles/styles';

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
            const guideList = await getGuides();
            setGuides(guideList);
        } catch (error) {
            console.error('Kılavuzları çekerken bir hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGuide = async (id) => {
        Alert.alert(
            'Silme Onayı',
            'Bu kılavuzu silmek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Evet',
                    onPress: async () => {
                        await deleteGuide(id);
                        fetchGuides();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleUploadJSON = () => {
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
            <GuideItem
                key={guide.id}
                guide={guide}
                onDelete={() => handleDeleteGuide(guide.id)}
                onEdit={() => navigation.navigate('EditGuide', { guideId: guide.id })}
                navigation={navigation}
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
                    onPress={handleUploadJSON}
                    style={styles.uploadButton}
                />
            </View>

            {/* Kılavuz Listesi */}
            <ScrollView>{renderGuides()}</ScrollView>
        </View>
    );
};

export default GuideManagementScreen;
