// src/components/items/GuideItem.js
import React, { useState, useEffect } from 'react';
import { List, Button } from 'react-native-paper';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Alert } from 'react-native';
import TestItem from './TestItem';

const GuideItem = ({ guide, onDelete, onEdit, navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [testTypes, setTestTypes] = useState([]);

    useEffect(() => {
        let unsubscribe;
        if (expanded) {
            // Realtime dinlemek için onSnapshot kullanıyoruz
            const guideRef = doc(db, 'guides', guide.id);
            unsubscribe = onSnapshot(guideRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setTestTypes(data.testTypes || []);
                }
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [expanded, guide.id]);

    const handleDeleteGuide = () => {
        Alert.alert(
            'Kılavuz Sil',
            `${guide.name} kılavuzunu silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: onDelete,
                },
            ]
        );
    };

    return (
        <List.Accordion
            title={guide.name}
            description={`Birim: ${guide.unit} | Tip: ${guide.type}`}
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
            left={(props) => <List.Icon {...props} icon="folder" />}
        >
            <Button onPress={onEdit} style={{ marginVertical: 5 }}>
                Düzenle
            </Button>
            <Button onPress={handleDeleteGuide} style={{ marginVertical: 5 }}>
                Sil
            </Button>
            <Button
                onPress={() => navigation.navigate('AddTest', { guideId: guide.id })}
                style={{ marginVertical: 5 }}
            >
                Yeni Tetkik Ekle
            </Button>
            {testTypes.map((test, index) => (
                <TestItem
                    key={test.name} // Daha iyi performans için test.name kullanıldı
                    guideId={guide.id}
                    test={test}
                    navigation={navigation}
                />
            ))}
        </List.Accordion>
    );
};

export default GuideItem;
