import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { login } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const { setUser } = useContext(AuthContext);

    // Kullanıcı bilgileri için state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen e-posta ve şifre alanlarını doldurun.');
            return;
        }

        try {
            const userCredential = await login(email, password);
            setUser(userCredential.user); // Kullanıcı bilgilerini AuthContext'e kaydet
        } catch (error) {
            console.log('Login Error:', error);
            Alert.alert('Hata', 'Giriş başarısız. E-posta veya şifre yanlış.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Giriş Yap</Text>
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
            <Button title="Giriş Yap" onPress={handleLogin} />
            <Button
                title="Hesabınız yok mu? Kayıt Olun"
                onPress={() => navigation.navigate('Register')}
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
});

export default LoginScreen;
