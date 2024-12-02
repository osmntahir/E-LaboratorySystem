// src/components/PatientItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PatientItem = ({ patient, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={() => onPress(patient)}>
            <Text style={styles.name}>{patient.name} {patient.surname}</Text>
            <Text style={styles.tcNo}>TC No: {patient.tcNo}</Text>
            <Text style={styles.birthDate}>Doğum Tarihi: {patient.birthDate}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    tcNo: {
        fontSize: 16
    },
    birthDate: {
        fontSize: 16
    }
});

export default PatientItem;
