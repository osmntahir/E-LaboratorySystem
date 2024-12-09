import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import TestResultItem from '../../components/items/TestResultItem';
import { useFocusEffect } from '@react-navigation/native';
import { deleteTestResult } from '../../services/testResultService';
import { Text, Button, Card, IconButton, Subheading, FAB, Divider, Menu, Searchbar } from 'react-native-paper';

const PatientDetailScreen = ({ route, navigation }) => {
    const { patient } = route.params;
    const [testResults, setTestResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newToOld'); // Varsayılan olarak Yeniden Eskiye
    const [menuVisible, setMenuVisible] = useState(false);

    const parseDate = (dateStr) => {
        const [datePart, timePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));

        let hourInt = 0;
        let minuteInt = 0;
        let secondInt = 0;

        if (timePart) {
            const timeSegments = timePart.split(':');
            hourInt = parseInt(timeSegments[0], 10) || 0;
            minuteInt = parseInt(timeSegments[1], 10) || 0;
            if (timeSegments.length === 3) {
                secondInt = parseInt(timeSegments[2], 10) || 0;
            }
        }

        return new Date(year, month - 1, day, hourInt, minuteInt, secondInt);
    };

    const fetchTestResults = useCallback(async () => {
        try {
            const q = query(collection(db, 'testResults'), where('patientTc', '==', patient.tcNo));
            const querySnapshot = await getDocs(q);
            const testResultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const sorted = testResultsData.sort((a, b) => {
                const dateA = parseDate(a.testDate);
                const dateB = parseDate(b.testDate);
                // Eskiden Yeniye (oldToNew) -> dateA - dateB
                // Yeniden Eskiye (newToOld) -> dateB - dateA
                if (sortOption === 'oldToNew') {
                    return dateA - dateB;
                } else {
                    return dateB - dateA;
                }
            });

            setTestResults(sorted);
        } catch (error) {
            console.error('Error fetching test results: ', error);
        }
    }, [patient.tcNo, sortOption]);

    useFocusEffect(
        useCallback(() => {
            fetchTestResults();
        }, [fetchTestResults])
    );

    const handleAddTestResult = () => {
        navigation.navigate('AddTestResult', { patient });
    };

    const handleEditTestResult = (testResult) => {
        navigation.navigate('EditTestResult', { testResult, patient });
    };

    const handleDeleteTestResult = (testResultId) => {
        Alert.alert(
            'Silme İşlemi',
            'Bu tahlil sonucunu silmek istediğinize emin misiniz?',
            [
                { text: 'İptal Et', style: 'cancel' },
                {
                    text: 'Sil',
                    onPress: async () => {
                        try {
                            await deleteTestResult(testResultId);
                            fetchTestResults();
                        } catch (error) {
                            console.error('Error deleting test result: ', error);
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    const filteredResults = testResults.filter(result =>
        result.tests.some(test => test.testName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleSortChange = (option) => {
        setSortOption(option);
        closeMenu();
    };

    return (
        <View style={styles.container}>
            <Card style={styles.patientCard}>
                <Card.Title
                    title={`${patient.name} ${patient.surname}`}
                    left={(props) => <IconButton {...props} icon="account" />}
                    titleStyle={styles.cardTitle}
                />
                <Card.Content>
                    <Text style={styles.infoText}>TC No: {patient.tcNo}</Text>
                    <Text style={styles.infoText}>Doğum Tarihi: {patient.birthDate}</Text>
                </Card.Content>
            </Card>

            <View style={styles.headerActions}>
                <Searchbar
                    placeholder="Test türü ara..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchbar}
                />
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={
                        <Button mode="outlined" onPress={openMenu} style={styles.menuButton}>
                            Sırala
                        </Button>
                    }
                >
                    <Menu.Item onPress={() => handleSortChange('oldToNew')} title="Eskiden Yeniye" />
                    <Menu.Item onPress={() => handleSortChange('newToOld')} title="Yeniden Eskiye" />
                </Menu>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {filteredResults.length === 0 ? (
                    <Text style={styles.noDataText}>Tahlil sonucu bulunmamaktadır.</Text>
                ) : (
                    filteredResults.map(item => (
                        <Card key={item.id} style={styles.resultCard}>
                            <Card.Content>
                                <TestResultItem testResult={item} />
                                <Divider style={{ marginVertical: 10 }} />
                                <View style={styles.actionsContainer}>
                                    <Button mode="text" onPress={() => handleEditTestResult(item)}>
                                        Düzenle
                                    </Button>
                                    <Button mode="text" color="red" onPress={() => handleDeleteTestResult(item.id)}>
                                        Sil
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>

            <FAB
                style={styles.fab}
                icon="plus"
                label="Tahlil Ekle"
                onPress={handleAddTestResult}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 10
    },
    patientCard: {
        marginBottom: 20,
        borderRadius: 10
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    infoText: {
        fontSize: 16,
        marginVertical: 2
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    searchbar: {
        flex: 1,
        marginRight: 10
    },
    menuButton: {
        height: 40
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        marginTop: 20
    },
    resultCard: {
        marginBottom: 15,
        borderRadius: 10
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#3f51b5'
    }
});

export default PatientDetailScreen;
