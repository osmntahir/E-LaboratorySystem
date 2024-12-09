// src/screens/PatientListScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet , FlatList } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Text, Card, Title, Subheading, Searchbar, IconButton, Divider } from 'react-native-paper';

const PatientListScreen = ({ navigation }) => {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredPatients = patients.filter(p =>
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.surname && p.surname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tcNo && p.tcNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View style={styles.container}>
            <Card style={styles.headerCard}>
                <Card.Title
                    title="Hasta Listesi"
                    left={(props) => <IconButton {...props} icon="account-group" />}
                    titleStyle={styles.headerTitle}
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
                // FlatList kullanarak uzun listelerde kaydırma desteği sağlıyoruz
                <View style={styles.listContainer}>
                    {/* FlatList */}
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
        flex: 1, // FlatList'in düzgün çalışması için parent container'a flex:1 veriyoruz
    },
    patientCard: {
        marginBottom: 15,
        borderRadius: 10
    }
});

export default PatientListScreen;
