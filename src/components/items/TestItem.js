// src/components/items/TestItem.js
import React, { useState } from 'react';
import { List, Button } from 'react-native-paper';

const TestItem = ({ guideId, test, navigation }) => {
    const [expanded, setExpanded] = useState(false);

    const handleAddAgeGroup = () => {
        navigation.navigate('AddAgeGroup', { guideId, testName: test.name });
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
                        guideId,
                        testName: test.name,
                    })
                }
                style={{ marginVertical: 5 }}
            >
                Test Düzenle
            </Button>

            <Button onPress={handleAddAgeGroup} style={{ marginVertical: 5 }}>
                Yaş Grubu Ekle
            </Button>

            {Array.isArray(test.ageGroups) &&
                test.ageGroups.map((ageGroup, index) => (
                    <List.Item
                        key={index}
                        title={`Yaş Aralığı: ${ageGroup.ageRange}`}
                        description={`Ref Min: ${ageGroup.referenceMin}, Ref Max: ${ageGroup.referenceMax}`}
                        left={(props) => <List.Icon {...props} icon="account-multiple" />}
                        onPress={() =>
                            navigation.navigate('EditAgeGroup', {
                                guideId,
                                testName: test.name,
                                ageGroupIndex: index, // index kullanıyoruz
                            })
                        }
                    />
                ))}
        </List.Accordion>
    );
};

export default TestItem;
