import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Text, Card, Title, Subheading, Searchbar, IconButton, Divider } from 'react-native-paper';
import { calculateAgeInMonths } from '../../utils/ageCalculator';

const PatientListScreen = ({ navigation }) => {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'patient'));
                const querySnapshot = await getDocs(q);
                const patientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const patientsWithAge = patientsData.map(patient => ({
                    ...patient,
                    ageInMonths: calculateAgeInMonths(patient.birthDate),
                }));

                setPatients(patientsWithAge);
            } catch (error) {
                console.error('Error fetching patients: ', error);
            }
        };

        fetchPatients();
    }, []);

    const handlePatientPress = (patient) => {
        navigation.navigate('PatientDetail', { patient });
    };

    const filteredPatients = patients.filter(p =>
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.surname && p.surname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tcNo && p.tcNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View style={styles.container}>
            <Card style={styles.headerCard}>
                <Card.Title
                    title={<Text style={styles.headerTitle}>Hasta Listesi</Text>}
                    left={(props) => <IconButton {...props} icon="account-group" />}
                />
                <Card.Content>
                    <Searchbar
                        placeholder="Hasta ara (isim, soyisim veya TC)"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbar}
                    />
                </Card.Content>
            </Card>

            {filteredPatients.length === 0 ? (
                <Text style={styles.noDataText}>Hasta bulunamadı.</Text>
            ) : (
                <View style={styles.listContainer}>
                    <FlatList
                        data={filteredPatients}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Card style={styles.patientCard} onPress={() => handlePatientPress(item)}>
                                <Card.Content>
                                    <Title>{item.name} {item.surname}</Title>
                                    <Subheading>TC: {item.tcNo}</Subheading>
                                    <Divider style={{ marginVertical: 10 }} />
                                    <Text>Doğum Tarihi: {item.birthDate}</Text>
                                    <Text>Yaş (Ay): {item.ageInMonths}</Text>
                                </Card.Content>
                            </Card>
                        )}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 10
    },
    headerCard: {
        borderRadius: 10,
        marginBottom: 20
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3f51b5'
    },
    searchbar: {
        marginTop: 10,
        borderRadius: 10,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777'
    },
    listContainer: {
        flex: 1,
    },
    patientCard: {
        marginBottom: 15,
        borderRadius: 10
    }
});

export default PatientListScreen;
