// src/components/TestItem.js
import React, { useState, useEffect } from 'react';
import { List, Button, Alert } from 'react-native-paper';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { deleteTest } from '../services/firebaseService';
import AgeGroupItem from './AgeGroupItem';
import { Alert as RNAlert } from 'react-native'; // Import Alert from react-native

const TestItem = ({ guideId, test, navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [ageGroups, setAgeGroups] = useState([]);

    const handleDeleteTest = async () => {
        console.log('Silme işlemi başlatıldı');
        RNAlert.alert(
            'Tetkik Sil',
            `${test.name} tetkikini silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        console.log('Silme işlemi onaylandı');
                        try {
                            await deleteTest(guideId, test.id);
                            console.log('Tetkik başarıyla silindi');
                        } catch (error) {
                            console.error('Tetkik silinirken hata oluştu:', error);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        if (expanded) {
            const q = query(collection(db, 'guides', guideId, 'tests', test.id, 'ageGroups'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const ageGroupList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAgeGroups(ageGroupList); // Ekranı otomatik günceller
            });

            return () => unsubscribe();
        }
    }, [expanded]);

    return (
        <List.Accordion
            title={test.name}
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
            left={(props) => <List.Icon {...props} icon="test-tube" />}
        >
            <Button
                onPress={() =>
                    navigation.navigate('EditTest', {
                        guideId: guideId,
                        testId: test.id,
                    })
                }
            >
                Düzenle
            </Button>
            <Button
                onPress={() =>
                    navigation.navigate('AddAgeGroup', {
                        guideId: guideId,
                        testId: test.id,
                    })
                }
            >
                Yeni Yaş Grubu Ekle
            </Button>
            <Button onPress={handleDeleteTest} mode="contained" color="red">
                Sil
            </Button>
            {ageGroups.map((ageGroup) => (
                <AgeGroupItem
                    key={ageGroup.id}
                    guideId={guideId}
                    testId={test.id}
                    ageGroup={ageGroup}
                    navigation={navigation}
                />
            ))}
        </List.Accordion>
    );
};

export default TestItem;