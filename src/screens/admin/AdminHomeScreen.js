import React, { useContext, useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getPatientCount, getTestCount } from "../../services/firebaseService";
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

const AdminHomeScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [patientCount, setPatientCount] = useState(0);
    const [testCount, setTestCount] = useState(0);

    const [menuOpen, setMenuOpen] = useState(false);
    const translateX = useRef(new Animated.Value(-screenWidth * 0.7)).current;

    useEffect(() => {
        navigation.setOptions({
            headerShown: false, // Üst bar'ı kaldırıp kendi tasarımımızı uygulayalım
        });
    }, [navigation]);

    useEffect(() => {
        const fetchData = async () => {
            const pCount = await getPatientCount();
            const tCount = await getTestCount();
            setPatientCount(pCount);
            setTestCount(tCount);
        };
        fetchData();
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
                colors={['#2c3e50', '#4ca1af']}
                style={styles.sideMenuContainer}
            >
                <View>
                    <Text style={styles.drawerHeader}>Menü</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {closeMenu(); navigation.navigate("GuideManagement");}}>
                        <Icon name="book" size={24} style={styles.menuIcon} color="#fff"/>
                        <Text style={styles.menuItemText}>Kılavuz Yönetimi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {closeMenu(); navigation.navigate("Patients");}}>
                        <Icon name="account-multiple" size={24} style={styles.menuIcon} color="#fff"/>
                        <Text style={styles.menuItemText}>Hasta Listesi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => {closeMenu(); navigation.navigate("TestAnalysis");}}>
                        <Icon name="magnify" size={24} style={styles.menuIcon} color="#fff"/>
                        <Text style={styles.menuItemText}>Tetkik Arama</Text>
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
            {/* Üst kısımda bir custom header alanı */}
            <LinearGradient
                colors={['#374ABE', '#64B6FF']}
                style={styles.headerContainer}
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                        <Icon name="menu" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Admin Paneli</Text>
                    <View style={{width: 28}} /> {/* Menü butonu boyutunda boşluk */}
                </View>
                <Text style={styles.greeting}>Merhaba, {user?.name || "Admin"}!</Text>
            </LinearGradient>

            {menuOpen && (
                <TouchableOpacity style={styles.overlay} onPress={closeMenu} activeOpacity={1} />
            )}
            {renderSideMenu()}

            <View style={styles.contentContainer}>
                <Text style={styles.subtitle}>Güncel Sistem İstatistikleri:</Text>
                <View style={styles.statsContainer}>
                    <LinearGradient
                        colors={['#ffffff', '#ecf0f1']}
                        style={styles.statItem}
                    >
                        <Icon name="account-multiple" size={36} color="#2E86C1" style={styles.statIcon}/>
                        <Text style={styles.statValue}>{patientCount}</Text>
                        <Text style={styles.statLabel}>Hasta</Text>
                    </LinearGradient>

                    <LinearGradient
                        colors={['#ffffff', '#ecf0f1']}
                        style={styles.statItem}
                    >
                        <Icon name="test-tube" size={36} color="#27AE60" style={styles.statIcon}/>
                        <Text style={styles.statValue}>{testCount}</Text>
                        <Text style={styles.statLabel}>Test</Text>
                    </LinearGradient>
                </View>
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
        backgroundColor: "#f5f7fa",
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
        backgroundColor: "rgba(255,0,0,0.8)",
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
