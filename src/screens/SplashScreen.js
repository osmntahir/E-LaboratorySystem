// src/screens/SplashScreen.js
import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/lab-tube.png')} // Lab tüpü simgesi için bir resim ekleyin.
                style={styles.image}
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
