// src/screens/admin/guideManagement/GuideDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Text, IconButton, Button, List } from 'react-native-paper';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { deleteGuide, deleteTest } from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const GuideDetailScreen = ({ route, navigation }) => {
    const { guideId } = route.params;
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const guideRef = doc(db, 'guides', guideId);
        const unsubscribe = onSnapshot(guideRef, (snap) => {
            if (snap.exists()) {
                setGuide({ id: snap.id, ...snap.data() });
            } else {
                setGuide(null);
            }
            setLoading(false);
        }, (error) => {
            console.error('Kılavuz dinlenirken hata:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [guideId]);

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
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Hata', 'Silme sırasında bir hata oluştu.');
                            console.error(err);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteTest = (testName) => {
        Alert.alert(
            'Silme Onayı',
            `${testName} tetkikini silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Evet',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTest(guideId, testName);
                        } catch (err) {
                            Alert.alert('Hata', 'Tetkik silinirken bir hata oluştu.');
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
                <Text style={styles.noDataText}>Kılavuz bulunamadı!</Text>
            </View>
        );
    }

    const { name, description, unit, type, testTypes } = guide;

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                    <ScrollView style={{ flexGrow: 1 }}>
                        {testTypes.map((test) => (
                            <List.Item
                                key={test.name}
                                title={test.name}
                                left={(props) => <List.Icon {...props} icon="test-tube" />}
                                right={() => (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <IconButton
                                            icon="pencil"
                                            size={20}
                                            onPress={() =>
                                                navigation.navigate('EditTest', {
                                                    guideId,
                                                    testName: test.name,
                                                })
                                            }
                                        />
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            onPress={() => handleDeleteTest(test.name)}
                                        />
                                    </View>
                                )}
                                onPress={() =>
                                    navigation.navigate('TestDetail', { guideId, testName: test.name })
                                }
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={styles.noDataText}>Henüz tetkik eklenmemiş.</Text>
                )}
            </View>
        </ScrollView>
    );

};

export default GuideDetailScreen;
