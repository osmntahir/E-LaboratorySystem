// src/screens/GuideManagementScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { getGuides, deleteGuide } from '../services/firebaseService';
import GuideItem from '../components/GuideItem';

const GuideManagementScreen = ({ navigation }) => {
    const [guides, setGuides] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchGuides();
        });
        return unsubscribe;
    }, [navigation]);

    const fetchGuides = async () => {
        const guideList = await getGuides();
        setGuides(guideList);
    };

    const handleDeleteGuide = async (id) => {
        await deleteGuide(id);
        fetchGuides();
    };

    return (
        <ScrollView>
            <Button mode="contained" onPress={() => navigation.navigate('AddGuide')}>
                Yeni Kılavuz Ekle
            </Button>
            {guides.map((guide) => (
                <GuideItem
                    key={guide.id}
                    guide={guide}
                    onDelete={() => handleDeleteGuide(guide.id)}
                    onEdit={() => navigation.navigate('EditGuide', { guideId: guide.id })}
                    navigation={navigation}
                />
            ))}
        </ScrollView>
    );
};

export default GuideManagementScreen;
