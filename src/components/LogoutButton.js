import React, { useContext } from "react";
import { View, Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../context/AuthContext";

const LogoutButton = () => {
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        Alert.alert(
            "Çıkış Yap",
            "Çıkış yapmak istediğinize emin misiniz?",
            [
                {
                    text: "İptal",
                    style: "cancel",
                },
                {
                    text: "Evet",
                    onPress: logout,
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e53935", // Kırmızı ton
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
    icon: {
        marginRight: 5,
    },
});

export default LogoutButton;
