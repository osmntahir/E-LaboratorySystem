// src/components/GuideItem.js
import React, { useState, useEffect } from 'react';
import { List, Button } from 'react-native-paper';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import TestItem from './TestItem';

const GuideItem = ({ guide, onDelete, onEdit, navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        if (expanded) {
            const unsubscribe = onSnapshot(
                collection(db, 'guides', guide.id, 'tests'),
                (snapshot) => {
                    const testList = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setTests(testList);
                }
            );
            return () => unsubscribe();
        }
    }, [expanded]);

    return (
        <List.Accordion
            title={guide.name}
            description={`Birim: ${guide.unit}`}
            expanded={expanded}
            onPress={() => setExpanded(!expanded)}
            left={(props) => <List.Icon {...props} icon="folder" />}
        >
            <Button onPress={onEdit}>Düzenle</Button>
            <Button onPress={onDelete}>Sil</Button>
            <Button
                onPress={() =>
                    navigation.navigate('AddTest', { guideId: guide.id })
                }
            >
                Yeni Tetkik Ekle
            </Button>
            {tests.map((test) => (
                <TestItem
                    key={test.id}
                    guideId={guide.id}
                    test={test}
                    navigation={navigation}
                />
            ))}
        </List.Accordion>
    );
};

export default GuideItem;