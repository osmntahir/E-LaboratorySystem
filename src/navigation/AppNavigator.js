import React, {useContext} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {AuthContext} from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import RoleBasedScreen from "../screens/auth/RoleBasedScreen";

const AppNavigator = () => {
    const {user} = useContext(AuthContext);

    return (
        <NavigationContainer>
            {user ? <RoleBasedScreen/> : <AuthNavigator/>}
        </NavigationContainer>
    );
};

export default AppNavigator;
