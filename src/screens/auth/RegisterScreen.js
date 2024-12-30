// src/screens/RegisterScreen.js
import React, { useState, useContext } from 'react';
import {
    View,
    Alert,
    StyleSheet,
    Platform,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    SafeAreaView
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Title,
    Card,
    Subheading
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { register } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import {
    setDoc,
    doc,
    getDocs,
    query,
    where,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const RegisterScreen = ({ navigation }) => {
    const { setUser } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [tcNo, setTcNo] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const checkExistingUser = async (email, tcNo) => {
        const usersRef = collection(db, 'users');

        const emailQuery = query(usersRef, where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);

        const tcQuery = query(usersRef, where('tcNo', '==', tcNo));
        const tcSnapshot = await getDocs(tcQuery);

        return {
            emailExists: !emailSnapshot.empty,
            tcNoExists: !tcSnapshot.empty,
        };
    };

    const handleRegister = async () => {
        // Input Validation
        if (!email || !password || !confirmPassword || !name || !surname || !tcNo) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor.');
            return;
        }

        if (tcNo.length !== 11 || isNaN(tcNo)) {
            Alert.alert('Hata', 'Geçerli bir TC Kimlik Numarası giriniz.');
            return;
        }

        try {
            const { emailExists, tcNoExists } = await checkExistingUser(email, tcNo);
            if (emailExists && tcNoExists) {
                Alert.alert('Hata', 'Bu e-posta ve TC Kimlik Numarası zaten kayıtlı.');
                return;
            } else if (emailExists) {
                Alert.alert('Hata', 'Bu e-posta zaten kayıtlı.');
                return;
            } else if (tcNoExists) {
                Alert.alert('Hata', 'Bu TC Kimlik Numarası zaten kayıtlı.');
                return;
            }

            // Register User with Firebase Auth
            const userCredential = await register(email, password);
            const user = userCredential.user;

            // Save User Data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                name: name,
                surname: surname,
                birthDate: birthDate.toISOString().split('T')[0],
                tcNo: tcNo,
                role: 'patient',
                createdAt: serverTimestamp(),
            });

            // Update AuthContext
            setUser({ ...user, role: 'patient' });

            // Optional: Alert Success (Commented Out)
            // Alert.alert('Başarılı', 'Kayıt başarılı oldu.');

            // Navigate Automatically Based on AuthContext
            // Since AuthContext is updated, navigation should occur automatically
            // Thus, navigation.navigate('Login') is not needed and can be removed
        } catch (error) {
            console.log('Register Error:', error);
            Alert.alert('Hata', 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Custom Header */}
                    <View style={styles.headerContainer}>
                        <Title style={styles.title}>E-Lab</Title>
                        <Subheading style={styles.subtitle}>Yeni Hesap Oluşturun</Subheading>
                    </View>

                    {/* Registration Form */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.formTitle}>Kayıt Ol</Text>
                            <TextInput
                                mode="outlined"
                                label="Ad"
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                            />
                            <TextInput
                                mode="outlined"
                                label="Soyad"
                                value={surname}
                                onChangeText={setSurname}
                                style={styles.input}
                            />

                            {/* Birth Date Picker */}
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateButton}
                            >
                                <Text style={styles.dateText}>
                                    Doğum Tarihi Seç: {birthDate.toISOString().split('T')[0]}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={birthDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                />
                            )}

                            <TextInput
                                mode="outlined"
                                label="TC Kimlik No"
                                value={tcNo}
                                onChangeText={setTcNo}
                                keyboardType="numeric"
                                style={styles.input}
                                maxLength={11}
                            />
                            <TextInput
                                mode="outlined"
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                            />
                            <TextInput
                                mode="outlined"
                                label="Şifre"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={styles.input}
                            />
                            <TextInput
                                mode="outlined"
                                label="Şifreyi Onayla"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                style={styles.input}
                            />

                            {/* Register Button */}
                            <Button
                                mode="contained"
                                onPress={handleRegister}
                                style={styles.button}
                            >
                                Kayıt Ol
                            </Button>

                            {/* Navigate to Login Screen */}
                            <Button
                                onPress={() => navigation.navigate('Login')}
                                style={styles.linkButton}
                            >
                                Zaten hesabınız var mı? Giriş Yapın
                            </Button>
                        </Card.Content>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f2f6ff',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingTop: 60, // Add top padding to create space above
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    subtitle: {
        fontSize: 16,
        color: '#333',
        marginTop: 5,
    },
    card: {
        borderRadius: 10,
        paddingVertical: 20,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#3f51b5',
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        paddingVertical: 10, // Increased padding for better touch area
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    linkButton: {
        marginTop: 10,
    },
    dateButton: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 12,
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#555',
    },
});

export default RegisterScreen;
