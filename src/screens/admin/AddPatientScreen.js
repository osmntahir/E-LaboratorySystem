// src/screens/admin/AddPatientScreen.js
import React, { useState } from 'react';
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
import { db, secondaryAuth } from '../../../firebaseConfig'; // Dikkat: secondaryAuth
import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { calculateAgeInMonths } from '../../utils/ageCalculator';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const AddPatientScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tcNo, setTcNo] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const checkExistingEmailOrTC = async (emailValue, tcNoValue) => {
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', emailValue));
        const emailSnapshot = await getDocs(emailQuery);

        const tcQuery = query(usersRef, where('tcNo', '==', tcNoValue));
        const tcSnapshot = await getDocs(tcQuery);

        return {
            emailExists: !emailSnapshot.empty,
            tcNoExists: !tcSnapshot.empty,
        };
    };

    const validateEmail = (emailString) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailString);
    };

    const handleAddPatient = async () => {
        if (!name || !surname || !email || !password || !tcNo) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Hata', 'Geçerli bir email adresi giriniz.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (tcNo.length !== 11 || isNaN(tcNo)) {
            Alert.alert('Hata', 'TC Kimlik Numarası 11 haneli olmalıdır.');
            return;
        }

        try {
            // Email ve TC benzersiz mi?
            const { emailExists, tcNoExists } = await checkExistingEmailOrTC(email, tcNo);
            if (emailExists) {
                Alert.alert('Hata', 'Bu email zaten kayıtlı.');
                return;
            }
            if (tcNoExists) {
                Alert.alert('Hata', 'Bu TC Kimlik Numarası zaten kayıtlı.');
                return;
            }

            // 1) Secondary Auth ile yeni kullanıcı oluştur => otomatik login olmaz
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCredential.user;

            // 2) Firestore'a ekle
            await setDoc(doc(db, 'users', newUser.uid), {
                name,
                surname,
                email,
                tcNo,
                birthDate: birthDate.toISOString().split('T')[0],
                ageInMonths: calculateAgeInMonths(birthDate),
                role: 'patient',
                createdAt: serverTimestamp(),
            });

            Alert.alert("Başarılı", "Yeni hasta başarıyla eklendi.");
            // 3) Hasta listesine geri dön
            navigation.goBack();
        } catch (error) {
            console.log('AddPatient Error:', error);
            Alert.alert('Hata', 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
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
                        title="Yeni Hasta Ekle"
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
                        />

                        <Text style={styles.label}>Şifre</Text>
                        <TextInput
                            mode="outlined"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            style={styles.input}
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
                            onPress={handleAddPatient}
                            style={styles.addButton}
                            icon="plus"
                        >
                            Ekle
                        </Button>
                        <Button
                            onPress={() => navigation.goBack()}
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

export default AddPatientScreen;

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
    addButton: {
        marginTop: 20,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    cancelButton: {
        marginTop: 10,
    },
});
