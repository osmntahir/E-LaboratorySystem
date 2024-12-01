import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { register } from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import { setDoc, doc, getDocs, query, where, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const RegisterScreen = ({ navigation }) => {
    const { setUser } = useContext(AuthContext);

    // Kullanıcı bilgileri için state
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

        // Email eşleşen kullanıcıyı sorgula
        const emailQuery = query(usersRef, where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);

        // TC No eşleşen kullanıcıyı sorgula
        const tcQuery = query(usersRef, where('tcNo', '==', tcNo));
        const tcSnapshot = await getDocs(tcQuery);

        return {
            emailExists: !emailSnapshot.empty,
            tcNoExists: !tcSnapshot.empty,
        };
    };

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword || !name || !surname || !tcNo) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter uzunluğunda olmalıdır.');
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

            const userCredential = await register(email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                name: name,
                surname: surname,
                birthDate: birthDate.toISOString().split('T')[0],
                tcNo: tcNo,
                role: 'patient',
                createdAt: serverTimestamp(),
            });

            setUser({ ...user, role: 'patient' });
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
        <View style={styles.container}>
            <Text style={styles.header}>Kayıt Ol</Text>
            <TextInput
                style={styles.input}
                placeholder="Ad"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Soyad"
                value={surname}
                onChangeText={setSurname}
            />
            <View>
                <Button title="Doğum Tarihini Seç" onPress={() => setShowDatePicker(true)} />
                <Text style={styles.selectedDate}>
                    Seçilen Tarih: {birthDate.toISOString().split('T')[0]}
                </Text>
                {showDatePicker && (
                    <DateTimePicker
                        value={birthDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={handleDateChange}
                    />
                )}
            </View>
            <TextInput
                style={styles.input}
                placeholder="TC Kimlik No"
                value={tcNo}
                onChangeText={setTcNo}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Şifreyi Onayla"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <Button title="Kayıt Ol" onPress={handleRegister} />
            <Button
                title="Zaten hesabınız var mı? Giriş Yapın"
                onPress={() => navigation.navigate('Login')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    selectedDate: {
        marginVertical: 10,
        fontSize: 16,
    },
});

export default RegisterScreen;
