import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import LogoutButton from "../components/LogoutButton";

const AdminHomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Admin Ana Sayfa</Text>
            <Button
                title="Kılavuz Yönetimine Git"
                onPress={() => navigation.navigate("GuideManagement")}
            />
            <Button
                title="Hasta Yönetimine Git"
                onPress={() => navigation.navigate("PatientManagement")}
            />
            <LogoutButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
});

export default AdminHomeScreen;
