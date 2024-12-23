// src/screens/admin/UpdatePatientScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, auth } from '../../../firebaseConfig';
import {
    doc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { updateEmail } from 'firebase/auth';
import { calculateAgeInMonths } from '../../utils/ageCalculator';

const UpdatePatientScreen = ({ route, navigation }) => {
    const { patient } = route.params || {};

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [tcNo, setTcNo] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isEmailEditable, setIsEmailEditable] = useState(false);

    useEffect(() => {
        if (patient) {
            setName(patient.name || '');
            setSurname(patient.surname || '');
            setEmail(patient.email || '');
            setTcNo(patient.tcNo || '');
            if (patient.birthDate) {
                setBirthDate(new Date(patient.birthDate));
            }
        }
    }, [patient]);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const validateEmail = (emailText) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailText);
    };

    const checkExistingTC = async (tcNoValue) => {
        const usersRef = collection(db, 'users');
        const tcQuery = query(usersRef, where('tcNo', '==', tcNoValue));
        const tcSnapshot = await getDocs(tcQuery);
        // Mevcut hastanın kendisini hariç tutmak için
        return !tcSnapshot.empty && tcSnapshot.docs.some(docSnap => docSnap.id !== patient.id);
    };

    const checkExistingEmail = async (emailValue) => {
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', emailValue));
        const emailSnapshot = await getDocs(emailQuery);
        // Mevcut hastanın kendisini hariç tutmak için
        return !emailSnapshot.empty && emailSnapshot.docs.some(docSnap => docSnap.id !== patient.id);
    };

    const handleUpdatePatient = async () => {
        if (!name || !surname || !tcNo || !email) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Hata', 'Geçerli bir email adresi giriniz.');
            return;
        }

        if (tcNo.length !== 11 || isNaN(tcNo)) {
            Alert.alert('Hata', 'Geçerli bir TC Kimlik Numarası giriniz (11 haneli).');
            return;
        }

        try {
            // TC Benzersizliği
            const tcExists = await checkExistingTC(tcNo);
            if (tcExists) {
                Alert.alert('Hata', 'Bu TC Kimlik Numarası zaten kayıtlı.');
                return;
            }

            // Email Benzersizliği
            if (email !== patient.email) {
                const emailExists = await checkExistingEmail(email);
                if (emailExists) {
                    Alert.alert('Hata', 'Bu email zaten kayıtlı.');
                    return;
                }
            }

            const patientRef = doc(db, 'users', patient.id);

            // Eğer email değiştirildiyse Auth'ta güncelle
            // (sadece "kendi" emailini değiştirebiliyorsanız çalışır.
            //  Admin modda client tarafında yapmak zordur.
            if (email !== patient.email) {
                await updateEmail(auth.currentUser, email);
            }

            await updateDoc(patientRef, {
                name,
                surname,
                email,
                tcNo,
                birthDate: birthDate.toISOString().split('T')[0],
                ageInMonths: calculateAgeInMonths(birthDate),
            });

            Alert.alert('Başarılı', 'Hasta bilgileri güncellendi!', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        // Geri dönmeye çalış
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('PatientList');
                        }
                    },
                },
            ]);
        } catch (error) {
            console.log('UpdatePatient Error:', error);
            Alert.alert('Hata', 'Güncelleme sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f2f6ff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Title
                        title="Hasta Güncelle"
                        titleStyle={styles.cardTitle}
                    />
                    <Card.Content>
                        <Text style={styles.label}>Ad</Text>
                        <TextInput
                            mode="outlined"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Soyad</Text>
                        <TextInput
                            mode="outlined"
                            value={surname}
                            onChangeText={setSurname}
                            style={styles.input}
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            mode="outlined"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            style={styles.input}
                            editable={isEmailEditable}
                            right={
                                <TextInput.Icon
                                    name={isEmailEditable ? "eye-off" : "eye"}
                                    onPress={() => setIsEmailEditable(!isEmailEditable)}
                                />
                            }
                        />

                        <Text style={styles.label}>Doğum Tarihi</Text>
                        <Button
                            mode="outlined"
                            onPress={() => setShowDatePicker(true)}
                            style={styles.dateButton}
                            icon="calendar"
                        >
                            {birthDate.toISOString().split('T')[0]}
                        </Button>
                        {showDatePicker && (
                            <DateTimePicker
                                value={birthDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}

                        <Text style={styles.label}>TC Kimlik No</Text>
                        <TextInput
                            mode="outlined"
                            value={tcNo}
                            onChangeText={setTcNo}
                            keyboardType="numeric"
                            maxLength={11}
                            style={styles.input}
                        />

                        <Button
                            mode="contained"
                            onPress={handleUpdatePatient}
                            style={styles.updateButton}
                            icon="content-save"
                        >
                            Kaydet
                        </Button>
                        <Button
                            onPress={() => {
                                if (navigation.canGoBack()) {
                                    navigation.goBack();
                                } else {
                                    navigation.navigate('PatientList');
                                }
                            }}
                            style={styles.cancelButton}
                        >
                            Vazgeç
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default UpdatePatientScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    card: {
        borderRadius: 10,
        paddingVertical: 10,
    },
    cardTitle: {
        fontSize: 22,
        color: '#3f51b5',
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        marginTop: 10,
        color: '#333',
    },
    input: {
        marginBottom: 5,
    },
    dateButton: {
        marginBottom: 10,
    },
    updateButton: {
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    cancelButton: {
        marginTop: 10,
    },
});
