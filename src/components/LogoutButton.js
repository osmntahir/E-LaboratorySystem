// src/components/LogoutButton.js
import React, { useContext } from 'react';
import { Button } from 'react-native';
import { logout } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const LogoutButton = () => {
    const { setUser } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.log('Logout Error:', error);
        }
    };

    return <Button title="Çıkış Yap" onPress={handleLogout} />;
};

export default LogoutButton;
