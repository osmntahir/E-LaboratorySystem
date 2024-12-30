// AdminHomeScreen.js
import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

const AdminHomeScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [patientCount, setPatientCount] = useState(null);
    const [testCount, setTestCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            headerShown: false, // Kendi özel header'ımızı kullanacağımız için default header'ı kapattık
        });
    }, [navigation]);

    useEffect(() => {
        // Firestore'dan gerçek zamanlı hasta sayısını dinleme
        const patientQuery = query(collection(db, "users"), where("role", "==", "patient"));
        const unsubscribePatients = onSnapshot(patientQuery, (snapshot) => {
            setPatientCount(snapshot.size);
        });

        // Firestore'dan gerçek zamanlı test sayısını dinleme
        const testCollection = collection(db, "testResults");
        const unsubscribeTests = onSnapshot(testCollection, (snapshot) => {
            setTestCount(snapshot.size);
        });

        setLoading(false);

        return () => {
            unsubscribePatients();
            unsubscribeTests();
        };
    }, []);

    const handleLogout = () => {
        Alert.alert(
            "Çıkış Yap",
            "Çıkış yapmak istediğinize emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                { text: "Evet", onPress: logout }
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Özel Header */}
            <LinearGradient
                colors={['#2ecc71', '#27ae60']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTopRow}>
                    <Text style={styles.headerTitle}>Laboratuvar Sistemi</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Icon name="logout" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.greeting}>Merhaba, {user?.name || "Admin"}!</Text>
            </LinearGradient>

            {/* İçerik Alanı */}
            <View style={styles.contentContainer}>
                <Text style={styles.subtitle}>Güncel Sistem İstatistikleri:</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#3498db" />
                ) : (
                    <View style={styles.statsContainer}>
                        <LinearGradient
                            colors={['#ffffff', '#f7f9f9']}
                            style={styles.statItem}
                        >
                            <Icon name="account-multiple" size={36} color="#1abc9c" style={styles.statIcon} />
                            <Text style={styles.statValue}>{patientCount}</Text>
                            <Text style={styles.statLabel}>Hasta</Text>
                        </LinearGradient>

                        <LinearGradient
                            colors={['#ffffff', '#f7f9f9']}
                            style={styles.statItem}
                        >
                            <Icon name="test-tube" size={36} color="#3498db" style={styles.statIcon} />
                            <Text style={styles.statValue}>{testCount}</Text>
                            <Text style={styles.statLabel}>Test</Text>
                        </LinearGradient>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    headerContainer: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 3,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        flex: 1
    },
    logoutButton: {
        padding: 5,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 10,
        color: '#fff'
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#ecf0f1",
        padding: 20
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        color: '#333',
        marginBottom: 20,
        fontWeight: '600'
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 20
    },
    statItem: {
        width: 130,
        alignItems: "center",
        borderRadius: 15,
        paddingVertical: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        marginBottom: 10
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    statLabel: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
        fontWeight: '500'
    }
});

export default AdminHomeScreen;
