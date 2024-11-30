// src/components/TestItem.js
import React, { useState, useEffect } from 'react';
import { List, Button } from 'react-native-paper';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import AgeGroupItem from './AgeGroupItem';

const TestItem = ({ guideId, test, navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [ageGroups, setAgeGroups] = useState([]);

    useEffect(() => {
        if (expanded) {
            const unsubscribe = onSnapshot(
                collection(db, 'guides', guideId, 'tests', test.id, 'ageGroups'),
                (snapshot) => {
                    const ageGroupList = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setAgeGroups(ageGroupList);
                }
            );
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
