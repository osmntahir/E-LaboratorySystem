// src/screens/users/ChangePasswordScreen.js
import React, { useState, useContext } from 'react';
import { View, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Title, Card, Subheading } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';

const ChangePasswordScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
            return;
        }

        try {
            // Re-authenticate the user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Update the password
            await updatePassword(auth.currentUser, newPassword);

            Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
            navigation.goBack();
        } catch (error) {
            console.log('Change Password Error:', error);
            Alert.alert('Hata', 'Şifre değiştirirken bir sorun oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f2f6ff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerContainer}>
                    <Title style={styles.title}>E-Lab</Title>
                    <Subheading style={styles.subtitle}>Şifre Değiştir</Subheading>
                </View>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.formTitle}>Şifre Değiştir</Text>
                        <TextInput
                            mode="outlined"
                            label="Mevcut Şifre"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                        <TextInput
                            mode="outlined"
                            label="Yeni Şifre"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                        <TextInput
                            mode="outlined"
                            label="Yeni Şifreyi Onayla"
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            secureTextEntry
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={handleChangePassword} style={styles.button}>
                            Şifreyi Değiştir
                        </Button>
                        <Button onPress={() => navigation.goBack()} style={styles.linkButton}>
                            Vazgeç
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
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
        paddingVertical: 5,
        borderRadius: 5,
        backgroundColor: '#3f51b5',
    },
    linkButton: {
        marginTop: 10,
    },
});

export default ChangePasswordScreen;
