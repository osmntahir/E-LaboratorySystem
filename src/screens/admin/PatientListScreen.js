// src/screens/admin/PatientListScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import {
    Text,
    Card,
    Title,
    Subheading,
    Searchbar,
    IconButton,
    Divider,
    FAB,
    Button,
} from 'react-native-paper';
import { calculateAgeInMonths } from '../../utils/ageCalculator';

const PatientListScreen = ({ navigation }) => {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Ekran odaklanınca veriyi yeniden çekelim
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPatients();
        });
        return unsubscribe;
    }, [navigation]);

    // Hastaları Firestore'dan çekmek için fonksiyon
    const fetchPatients = async () => {
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'patient'));
            const querySnapshot = await getDocs(q);
            const patientsData = querySnapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));

            const patientsWithAge = patientsData.map((patient) => ({
                ...patient,
                ageInMonths: calculateAgeInMonths(patient.birthDate),
            }));

            setPatients(patientsWithAge);
        } catch (error) {
            console.error('Error fetching patients: ', error);
        }
    };

    const handlePatientPress = (patient) => {
        navigation.navigate('PatientDetail', { patient });
    };

    const handleDeletePatient = (patient) => {
        Alert.alert(
            'Hastayı Sil',
            `${patient.name} ${patient.surname} adlı hastayı silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'users', patient.id));
                            // Silindikten sonra local state'ten de çıkaralım
                            setPatients((prev) => prev.filter((p) => p.id !== patient.id));
                            Alert.alert('Başarılı', 'Hasta başarıyla silindi.');
                        } catch (error) {
                            console.error('Error deleting patient: ', error);
                            Alert.alert('Hata', 'Hastayı silerken bir hata oluştu.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleUpdatePatient = (patient) => {
        navigation.navigate('UpdatePatient', { patient });
    };

    const handleViewGraph = (patient) => {
        navigation.navigate('PatientGraphic', { patient });
    };

    const handleAddPatient = () => {
        navigation.navigate('AddPatient');
    };

    // Arama filtresi
    const filteredPatients = patients.filter(
        (p) =>
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
                            <Card style={styles.patientCard}>
                                <Card.Content>
                                    <Title>{item.name} {item.surname}</Title>
                                    <Subheading>TC: {item.tcNo}</Subheading>
                                    <Divider style={{ marginVertical: 10 }} />
                                    <Text>Doğum Tarihi: {item.birthDate}</Text>
                                    <Text>Yaş (Ay): {item.ageInMonths}</Text>
                                    <View style={styles.buttonRow}>
                                        <Button
                                            icon="eye"
                                            mode="text"
                                            onPress={() => handlePatientPress(item)}
                                            style={styles.actionButton}
                                        >
                                            Detay
                                        </Button>
                                        <Button
                                            icon="chart-line"
                                            mode="text"
                                            onPress={() => handleViewGraph(item)}
                                            style={styles.actionButton}
                                        >
                                            Grafik
                                        </Button>
                                        <Button
                                            icon="pencil"
                                            mode="text"
                                            onPress={() => handleUpdatePatient(item)}
                                            style={styles.actionButton}
                                        >
                                            Güncelle
                                        </Button>
                                        <Button
                                            icon="delete"
                                            mode="text"
                                            color="red"
                                            onPress={() => handleDeletePatient(item)}
                                            style={styles.actionButton}
                                        >
                                            Sil
                                        </Button>
                                    </View>
                                </Card.Content>
                            </Card>
                        )}
                    />
                </View>
            )}

            {/* Yeni Hasta Ekle FAB */}
            <FAB
                style={styles.fab}
                icon="plus"
                label="Hasta Ekle"
                onPress={handleAddPatient}
            />
        </View>
    );
};

export default PatientListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 10,
    },
    headerCard: {
        borderRadius: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    searchbar: {
        marginTop: 10,
        borderRadius: 10,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    listContainer: {
        flex: 1,
    },
    patientCard: {
        marginBottom: 15,
        borderRadius: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    actionButton: {
        marginRight: 5,
        marginBottom: 5,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#3f51b5',
    },
});
