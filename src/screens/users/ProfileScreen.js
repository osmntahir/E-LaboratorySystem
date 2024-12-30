// ./src/screens/users/ProfileScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Title, Card, Subheading } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => { // navigation prop'u eklendi
    const { user } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [tcNo, setTcNo] = useState('');
    const [email, setEmail] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user || !user.uid) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setName(userData.name || '');
                    setSurname(userData.surname || '');
                    setEmail(userData.email || '');
                    setTcNo(userData.tcNo || '');
                    if (userData.birthDate) {
                        setBirthDate(new Date(userData.birthDate));
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Hata', 'Kullanıcı bilgileri alınırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const handleSave = async () => {
        if (!user || !user.uid) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                name: name,
                surname: surname,
                birthDate: birthDate.toISOString().split('T')[0],
                // email burada güncellenmiyor, isterseniz email güncellemeyi de ekleyebilirsiniz.
            });
            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
        }
    };

    const handleChangePassword = () => {
        navigation.navigate('ChangePassword'); // ChangePassword ekranına yönlendirme
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Title style={styles.title}>Profil Yönetimi</Title>
                <Subheading style={styles.subtitle}>Bilgilerinizi Güncelleyin</Subheading>
            </View>
            <Card style={styles.card}>
                <Card.Content>
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

                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                        <Text style={styles.dateText}>Doğum Tarihi: {birthDate.toISOString().split('T')[0]}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={birthDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}

                    <TextInput
                        mode="outlined"
                        label="TC Kimlik No"
                        value={tcNo}
                        editable={false} // TC Kimlik No genelde değişmez, isterseniz editable yapabilirsiniz.
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Email"
                        value={email}
                        editable={false} // Email genelde bu aşamada değiştirilmiyor.
                        style={styles.input}
                    />

                    <Button mode="contained" onPress={handleSave} style={styles.button}>
                        Kaydet
                    </Button>

                    {/* Şifre Değiştir Butonu Ekleniyor */}
                    <Button
                        mode="outlined"
                        onPress={handleChangePassword}
                        style={styles.changePasswordButton}
                        contentStyle={styles.changePasswordContent}
                    >
                        Şifre Değiştir
                    </Button>
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 20,
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
        fontSize: 18,
        color: '#333',
        marginTop: 5,
    },
    card: {
        borderRadius: 10,
        paddingVertical: 20,
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
    changePasswordButton: {
        marginTop: 15,
        borderColor: '#3f51b5',
    },
    changePasswordContent: {
        height: 50,
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

export default ProfileScreen;
