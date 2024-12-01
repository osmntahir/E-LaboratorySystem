import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import AdminNavigator from "../navigation/AdminNavigator";
import UserNavigator from "../navigation/UserNavigator";

const RoleBasedScreen = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Rol bazlı yönlendirme
    //console.log("RoleBasedScreen", user);
    //console.log(user.role);
    return user.role === "admin" ? <AdminNavigator /> : <UserNavigator />;
};

export default RoleBasedScreen;
