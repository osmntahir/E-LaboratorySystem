// src/screens/users/UserHomeScreen.js
import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform } from "react-native";
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import { db, auth } from "../../../firebaseConfig"; // auth'u firebaseConfig'den import edin
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

const subscribeToUserTestCount = (userTcNo, callback) => {
    const testQuery = query(collection(db, "testResults"), where("patientTc", "==", userTcNo));
    return onSnapshot(testQuery, (snapshot) => {
        callback(snapshot.size);
    });
};

const UserHomeScreen = () => {
    const { user } = useContext(AuthContext);
    const [testCount, setTestCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe = null;

        if (user && user.tcNo) {
            unsubscribe = subscribeToUserTestCount(user.tcNo, (count) => {
                setTestCount(count);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    const handleLogout = () => {
        Alert.alert(
            "Çıkış Yap",
            "Çıkış yapmak istediğinize emin misiniz?",
            [
                {
                    text: "İptal",
                    onPress: () => {},
                    style: "cancel"
                },
                {
                    text: "Evet",
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            // Oturum kapandıktan sonra AuthContext veya navigasyon reset ile yönlendirme yapılabilir
                        } catch (error) {
                            console.error('Error signing out: ', error);
                            Alert.alert('Hata', 'Çıkış yaparken bir hata oluştu.');
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/** Üst Header alanı **/}
            <LinearGradient
                colors={['#42A5F5', '#4DB6AC', '#81C784']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTopRow}>
                    <Text style={styles.headerTitle}>Laboratuvar Sistemi</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Icon name="logout" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.greeting}>Hoş Geldiniz, {user?.name || "Kullanıcı"}!</Text>
            </LinearGradient>

            {/** İçerik Alanı **/}
            <View style={styles.contentContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#3f51b5" />
                ) : (
                    <>
                        <Text style={styles.infoText}>
                            Şu ana kadar verdiğiniz tahlil sayısı:
                        </Text>
                        <View style={styles.statItem}>
                            <Icon name="test-tube" size={48} color="#42A5F5" style={styles.statIcon} />
                            <Text style={styles.statValue}>{testCount}</Text>
                            <Text style={styles.statLabel}>Tahlil</Text>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50, // iOS için SafeArea desteği
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 3,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    logoutButton: {
        padding: 5,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 10,
        color: '#fff',
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    infoText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: '600',
    },
    statItem: {
        width: 160,
        alignItems: "center",
        borderRadius: 15,
        paddingVertical: 25,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    statIcon: {
        marginBottom: 10,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
        fontWeight: '500',
    },
});

export default UserHomeScreen;
