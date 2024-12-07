// ./src/screens/users/UserHomeScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-paper';
import LogoutButton from "../../components/LogoutButton";

const UserHomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Kullanıcı Ana Sayfa</Text>

            <Button
                mode="contained"
                onPress={() => navigation.navigate("TestResults")}
                style={styles.button}
            >
                Tahlil Sonuçlarına Git
            </Button>

            <Button
                mode="contained"
                onPress={() => navigation.navigate("Profile")}
                style={styles.button}
            >
                Profilimi Yönet
            </Button>

            <LogoutButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
        color: '#3f51b5'
    },
    button: {
        marginBottom: 15,
        backgroundColor: '#3f51b5',
    },
});

export default UserHomeScreen;
