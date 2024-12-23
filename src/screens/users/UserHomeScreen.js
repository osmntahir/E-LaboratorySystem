import React, { useRef, useState, useEffect, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { db } from "../../../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const screenWidth = Dimensions.get('window').width;

const subscribeToUserTestCount = (userTcNo, callback) => {
    const testQuery = query(collection(db, "testResults"), where("patientTc", "==", userTcNo));
    const unsubscribe = onSnapshot(testQuery, (snapshot) => {
        callback(snapshot.size);
    });
    return unsubscribe;
};

const UserHomeScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const translateX = useRef(new Animated.Value(-screenWidth * 0.7)).current;

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

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
        Animated.timing(translateX, {
            toValue: menuOpen ? -screenWidth * 0.7 : 0,
            duration: 300,
            useNativeDriver: false
        }).start();
    };

    const closeMenu = () => {
        setMenuOpen(false);
        Animated.timing(translateX, {
            toValue: -screenWidth * 0.7,
            duration: 300,
            useNativeDriver: false
        }).start();
    };

    const handleNavigate = (screenName) => {
        closeMenu();
        navigation.navigate(screenName);
    };

    const renderSideMenu = () => (
        <Animated.View style={[styles.sideMenuAnimatedContainer, { transform: [{ translateX }] }]}>
            <LinearGradient
                colors={['#00695C', '#004D40']}
                style={styles.sideMenuContainer}
            >
                <View>
                    <Text style={styles.drawerHeader}>Menü</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("TestResults")}>
                        <Icon name="flask" size={24} style={styles.menuIcon} color="#fff" />
                        <Text style={styles.menuItemText}>Tahlil Sonuçları</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("Profile")}>
                        <Icon name="account" size={24} style={styles.menuIcon} color="#fff" />
                        <Text style={styles.menuItemText}>Profil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("ChangePassword")}>
                        <Icon name="lock" size={24} style={styles.menuIcon} color="#fff" />
                        <Text style={styles.menuItemText}>Şifre Değiştir</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.logoutContainer}>
                    <LogoutButton />
                </View>
            </LinearGradient>
        </Animated.View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.mainContainer}>
                    <LinearGradient
                        colors={['#42A5F5', '#4DB6AC', '#81C784']}
                        style={styles.headerContainer}
                    >
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={toggleMenu} style={styles.headerButton}>
                                <Icon name="menu" size={28} color="#fff" />
                            </TouchableOpacity>

                        </View>
                        <Text style={styles.greeting}>Hoş Geldiniz, {user?.name || "Kullanıcı"}!</Text>

                    </LinearGradient>

                    {menuOpen && (
                        <TouchableOpacity style={styles.overlay} onPress={closeMenu} activeOpacity={1} />
                    )}
                    {renderSideMenu()}

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
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    headerContainer: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 3,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: '100%',
        alignItems: 'center',
    },
    headerButton: {
        padding: 5,
    },
    greeting: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 10,
        textAlign: "center",
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        marginTop: 5,
        textAlign: "center",
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
        justifyContent: 'space-between',
    },
    drawerHeader: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: '#fff',
        textAlign: 'left',
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
        fontWeight: '500',
    },
    menuIcon: {
        width: 24,
        textAlign: "center",
    },
    logoutContainer: {
        paddingVertical: 30,
    },
    overlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 1,
    },
});

export default UserHomeScreen;
