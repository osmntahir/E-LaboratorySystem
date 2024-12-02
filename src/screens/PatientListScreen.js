// src/screens/PatientListScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import PatientItem from '../components/PatientItem';

const PatientListScreen = ({ navigation }) => {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'patient'));
                const querySnapshot = await getDocs(q);
                const patientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPatients(patientsData);
            } catch (error) {
                console.error('Error fetching patients: ', error);
            }
        };

        fetchPatients();
    }, []);

    const handlePatientPress = (patient) => {
        navigation.navigate('PatientDetail', { patient });
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={patients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PatientItem patient={item} onPress={handlePatientPress} />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default PatientListScreen;
