// src/screens/admin/guideManagement/TestDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Text, Button, IconButton, List } from 'react-native-paper';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { deleteTest } from '../../../services/firebaseService';
import styles from '../../../styles/styles';

const TestDetailScreen = ({ route, navigation }) => {
    const { guideId, testName } = route.params;

    const [guide, setGuide] = useState(null);
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestDetail();
    }, []);

    const fetchTestDetail = async () => {
        setLoading(true);
        try {
            const guideRef = doc(db, 'guides', guideId);
            const snap = await getDoc(guideRef);
            if (snap.exists()) {
                const guideData = { id: snap.id, ...snap.data() };
                setGuide(guideData);
                const foundTest = guideData.testTypes?.find((t) => t.name === testName);
                if (foundTest) {
                    setTest(foundTest);
                }
            }
        } catch (error) {
            console.error('Test detayı alınırken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTest = () => {
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
                            navigation.goBack(); // Silindikten sonra bir üst ekrana dön
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

    if (!test) {
        return (
            <View style={styles.container}>
                <Text style={styles.noDataText}>Tetkik bulunamadı!</Text>
            </View>
        );
    }

    const { name, ageGroups } = test;

    return (
        <View style={styles.container}>
            {/* Tetkik Adı */}
            <View style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{name}</Text>
            </View>

            {/* Tetkik Düzenle / Sil Butonları */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <Button
                    mode="contained"
                    onPress={() =>
                        navigation.navigate('EditTest', {
                            guideId,
                            testName: name,
                        })
                    }
                    style={{ marginRight: 10 }}
                >
                    Tetkik Düzenle
                </Button>
                <Button mode="contained" onPress={handleDeleteTest} color="#c62828">
                    Sil
                </Button>
            </View>

            {/* Yaş Grupları Başlık + Ekle Butonu */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, flex: 1 }}>
                    Yaş Grupları
                </Text>
                <IconButton
                    icon="plus"
                    size={24}
                    onPress={() =>
                        navigation.navigate('AddAgeGroup', {
                            guideId,
                            testName: name,
                        })
                    }
                />
            </View>

            {/* Yaş Grupları Listesi */}
            {Array.isArray(ageGroups) && ageGroups.length > 0 ? (
                ageGroups.map((ageGroup, index) => (
                    <List.Item
                        key={index}
                        title={`Yaş Aralığı: ${ageGroup.ageRange}`}
                        description={`Ref Min: ${ageGroup.referenceMin}, Ref Max: ${ageGroup.referenceMax}`}
                        left={(props) => <List.Icon {...props} icon="account-multiple" />}
                        onPress={() =>
                            navigation.navigate('EditAgeGroup', {
                                guideId,
                                testName: name,
                                ageGroupIndex: index,
                            })
                        }
                    />
                ))
            ) : (
                <Text style={styles.noDataText}>
                    Henüz yaş grubu eklenmemiş.
                </Text>
            )}
        </View>
    );
};

export default TestDetailScreen;
