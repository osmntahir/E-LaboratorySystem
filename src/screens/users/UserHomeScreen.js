import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import LogoutButton from "../../components/LogoutButton";

const UserHomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Kullanıcı Ana Sayfa</Text>
            <Button
                title="Tahlil Sonuçlarına Git"
                onPress={() => navigation.navigate("TestResults")}
            />
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
        marginBottom: 20,
    },
});

export default UserHomeScreen;
