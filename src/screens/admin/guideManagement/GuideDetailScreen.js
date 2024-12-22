// src/screens/admin/guideManagement/GuideDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Text, IconButton, Button, List } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { deleteGuide } from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const GuideDetailScreen = ({ route, navigation }) => {
    const { guideId } = route.params;
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGuideDetail();
    }, []);

    const fetchGuideDetail = async () => {
        setLoading(true);
        try {
            const guideRef = doc(db, 'guides', guideId);
            const snap = await getDoc(guideRef);
            if (snap.exists()) {
                setGuide({ id: snap.id, ...snap.data() });
            }
        } catch (error) {
            console.error('Kılavuz detayı çekilirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGuide = () => {
        Alert.alert(
            'Silme Onayı',
            `${guide?.name} kılavuzunu silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Evet',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteGuide(guideId);
                            navigation.goBack(); // Kılavuz silindikten sonra bir üst ekrana (GuideManagement) dön
                        } catch (err) {
                            Alert.alert('Hata', 'Silme sırasında bir hata oluştu.');
                            console.error(err);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    if (!guide) {
        return (
            <View style={styles.container}>
                <Text>Kılavuz bulunamadı!</Text>
            </View>
        );
    }

    const { name, description, unit, type, testTypes } = guide;

    return (
        <View style={styles.container}>
            {/* Kılavuz Detayları */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{name}</Text>
                <Text>Açıklama: {description}</Text>
                <Text>Birim: {unit}</Text>
                <Text>Tip: {type}</Text>
            </View>

            {/* Kılavuz Düzenle / Sil Butonları */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('EditGuide', { guideId })}
                    style={{ marginRight: 10 }}
                >
                    Kılavuzu Düzenle
                </Button>
                <Button mode="contained" onPress={handleDeleteGuide} color="#c62828">
                    Sil
                </Button>
            </View>

            {/* Tetkik Listesi Başlık + Ekle Butonu */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, flex: 1 }}>
                    Tetkik Listesi
                </Text>
                <IconButton
                    icon="plus"
                    size={24}
                    onPress={() => navigation.navigate('AddTest', { guideId })}
                />
            </View>

            {/* Tetkik Listesi */}
            {Array.isArray(testTypes) && testTypes.length > 0 ? (
                testTypes.map((test, index) => (
                    <List.Item
                        key={test.name}
                        title={test.name}
                        left={(props) => <List.Icon {...props} icon="test-tube" />}
                        onPress={() => navigation.navigate('TestDetail', { guideId, testName: test.name })}
                    />
                ))
            ) : (
                <Text style={styles.noDataText}>Henüz tetkik eklenmemiş.</Text>
            )}
        </View>
    );
};

export default GuideDetailScreen;
