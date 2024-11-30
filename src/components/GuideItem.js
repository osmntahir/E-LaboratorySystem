// src/components/GuideItem.js
import React, { useState, useEffect } from 'react';
import { List, Button } from 'react-native-paper';
import { getTests } from '../services/firebaseService';
import TestItem from './TestItem';

const GuideItem = ({ guide, onDelete, onEdit, navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        if (expanded) {
            fetchTests();
        }
    }, [expanded]);

    const fetchTests = async () => {
        const testList = await getTests(guide.id);
        setTests(testList);
    };

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
