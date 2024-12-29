// AdminHomeScreen.js
import React, { useContext, useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert, ActivityIndicator } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig"; // Firestore bağlantısını ekledik
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

const AdminHomeScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [patientCount, setPatientCount] = useState(null);
    const [testCount, setTestCount] = useState(null);
    const [loading, setLoading] = useState(true);

    const [menuOpen, setMenuOpen] = useState(false);
    const translateX = useRef(new Animated.Value(-screenWidth * 0.7)).current;

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
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

        // Bellek sızıntısını önlemek için abonelikten çık
        return () => {
            unsubscribePatients();
            unsubscribeTests();
        };
    }, []);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: menuOpen ? 0 : -screenWidth * 0.7,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [menuOpen, translateX]);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

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

    const renderSideMenu = () => (
        <Animated.View style={[styles.sideMenuAnimatedContainer, { transform: [{ translateX }] }]}>
            <LinearGradient
                colors={['#1abc9c', '#16a085']}
                style={styles.sideMenuContainer}
            >
                <View>
                    <Text style={styles.drawerHeader}>Menü</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate("GuideManagement"); }}>
                        <Icon name="book" size={24} style={styles.menuIcon} color="#fff" />
                        <Text style={styles.menuItemText}>Kılavuz Yönetimi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate("Patients"); }}>
                        <Icon name="account-multiple" size={24} style={styles.menuIcon} color="#fff" />
                        <Text style={styles.menuItemText}>Hasta Listesi</Text>
                    </TouchableOpacity>

                    {/* Hızlı Tahlil Sorgulama Menü Item */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate("TestAnalysis"); }}>
                        <Icon name="flash" size={24} style={styles.menuIcon} color="#fff" />
                        <Text style={styles.menuItemText}>Hızlı Tahlil Sorgulama</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" size={20} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    return (
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={['#2ecc71', '#27ae60']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                        <Icon name="menu" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Laboratuvar Sistemi</Text>
                    <View style={{ width: 28 }} />
                </View>
                <Text style={styles.greeting}>Merhaba, {user?.name || "Admin"}!</Text>
            </LinearGradient>

            {menuOpen && (
                <TouchableOpacity style={styles.overlay} onPress={closeMenu} activeOpacity={1} />
            )}
            {renderSideMenu()}

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
    mainContainer: {
        flex: 1,
    },
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
    menuButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        flex: 1
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
    },
    sideMenuAnimatedContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '70%',
        zIndex: 2,
    },
    sideMenuContainer: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    drawerHeader: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: '#fff',
        textAlign: 'left'
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
    },
    menuItemText: {
        fontSize: 18,
        marginLeft: 10,
        color: '#fff',
        fontWeight: '500'
    },
    menuIcon: {
        width: 24,
        textAlign: "center"
    },
    logoutContainer: {
        paddingVertical: 30,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: "#e74c3c",
        borderRadius: 8
    },
    logoutButtonText: {
        fontSize: 16,
        color: "#fff",
        marginLeft: 10,
        fontWeight: '600'
    },
    overlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1
    }
});

export default AdminHomeScreen;
