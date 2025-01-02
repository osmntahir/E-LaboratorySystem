// src/screens/SplashScreen.js
import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://www.creativefabrica.com/wp-content/uploads/2018/10/Lab-tube-by-Iconika-580x361.jpg' }}
            />
            <Text style={styles.title}>E-Laboratuvar Sistemi</Text>
        </View>
    );
};


export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f6ff',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
});
