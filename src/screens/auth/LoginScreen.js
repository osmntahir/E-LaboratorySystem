// src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Title, Subheading, Card } from 'react-native-paper';
import { login } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen e-posta ve şifre alanlarını doldurun.');
            return;
        }

        try {
            const userCredential = await login(email, password);
            setUser(userCredential.user);
        } catch (error) {
            console.log('Login Error:', error);
            Alert.alert('Hata', 'Giriş başarısız. E-posta veya şifre yanlış.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Title style={styles.title}>E-Lab</Title>
                <Subheading style={styles.subtitle}>Hızlı ve Güvenli Laboratuvar Yönetimi</Subheading>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.formContainer}
            >
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.formTitle}>Giriş Yap</Text>

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

                        <Button mode="contained" onPress={handleLogin} style={styles.button}>
                            Giriş Yap
                        </Button>

                        <Button
                            onPress={() => navigation.navigate('Register')}
                            style={styles.linkButton}
                        >
                            Hesabınız yok mu? Kayıt Olun
                        </Button>
                    </Card.Content>
                </Card>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff', // Hafif bir arka plan rengi
        justifyContent: 'flex-center',
    },
    headerContainer: {
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
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
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
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
        paddingVertical: 5,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    linkButton: {
        marginTop: 10,
    },
});

export default LoginScreen;
