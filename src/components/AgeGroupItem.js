// src/components/AgeGroupItem.js
import React from 'react';
import { List, Button } from 'react-native-paper';
import { deleteAgeGroup } from '../services/firebaseService';

const AgeGroupItem = ({ guideId, testId, ageGroup, navigation }) => {
    const handleDeleteAgeGroup = async () => {
        try {
            await deleteAgeGroup(guideId, testId, ageGroup.id);
            console.log(`${ageGroup.ageRange} yaş grubu silindi`);
        } catch (error) {
            console.error('Yaş grubu silme işlemi başarısız:', error);
        }
    };

    return (
        <List.Item
            title={`${ageGroup.ageRange} yaş aralığı`}
            description={`Min: ${ageGroup.minValue}, Max: ${ageGroup.maxValue}`}
            left={(props) => <List.Icon {...props} icon="account-group" />}
            right={() => (
                <>
                    <Button
                        onPress={() =>
                            navigation.navigate('EditAgeGroup', {
                                guideId: guideId,
                                testId: testId,
                                ageGroupId: ageGroup.id,
                            })
                        }
                    >
                        Düzenle
                    </Button>
                    <Button onPress={handleDeleteAgeGroup}>Sil</Button>
                </>
            )}
        />
    );
};

export default AgeGroupItem;
