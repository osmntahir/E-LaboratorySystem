// src/components/TestItem.js
import React, { useState, useEffect } from 'react';
import { List, Button } from 'react-native-paper';
import { getAgeGroups, deleteTest } from '../services/firebaseService';
import AgeGroupItem from './AgeGroupItem';

const TestItem = ({ guideId, test, navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [ageGroups, setAgeGroups] = useState([]);

    useEffect(() => {
        if (expanded) {
            fetchAgeGroups();
        }
    }, [expanded]);

    const fetchAgeGroups = async () => {
        const ageGroupList = await getAgeGroups(guideId, test.id);
        setAgeGroups(ageGroupList);
    };

    const handleDeleteTest = async () => {
        await deleteTest(guideId, test.id);
        // Tetkik silindikten sonra listeyi güncellemek için
        setExpanded(false);
    };

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
            <Button onPress={handleDeleteTest}>Sil</Button>
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
