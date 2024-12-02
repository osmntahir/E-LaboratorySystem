// src/components/AuthForm.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const AuthForm = ({ headerText, onSubmit, submitButtonText }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View>
            <Text>{headerText}</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                secureTextEntry
            />
            <Button title={submitButtonText} onPress={() => onSubmit(email, password)} />
        </View>
    );
};

export default AuthForm;
