// src/components/TestResultItem.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';

const TestResultItem = ({ testResult }) => {
    const tests = testResult.tests || [];

    const getStatusIconAndColor = (status) => {
        let icon = 'minus';
        let color = 'green';
        if (status === 'Yüksek') {
            icon = 'arrow-up-bold';
            color = 'red';
        } else if (status === 'Düşük') {
            icon = 'arrow-down-bold';
            color = 'orange';
        } else if (status === 'Normal') {
            icon = 'minus';
            color = 'green';
        }
        return { icon, color };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.date}>Tarih: {testResult.testDate || 'N/A'}</Text>
            <Divider style={{ marginVertical: 5 }} />
            {tests.length > 0 ? (
                tests.map((test, index) => (
                    <View key={index} style={styles.testContainer}>
                        <Text style={styles.testName}>Test: {test.testName || 'N/A'}</Text>
                        <Text style={styles.testValue}>Değer: {test.testValue !== undefined ? test.testValue : 'N/A'}</Text>

                        {Array.isArray(test.guideEvaluations) && test.guideEvaluations.length > 0 ? (
                            test.guideEvaluations.map((evaluation, idx) => {
                                const { icon, color } = getStatusIconAndColor(evaluation.status);
                                return (
                                    <View key={idx} style={styles.evaluationContainer}>
                                        <View style={styles.statusRow}>
                                            <Avatar.Icon
                                                size={24}
                                                icon={icon}
                                                style={{ backgroundColor: 'transparent' }}
                                                color={color}
                                            />
                                            <Text style={[styles.statusText, { color }]}>
                                                {evaluation.status || 'N/A'}
                                            </Text>
                                        </View>
                                        <Text style={styles.guideName}>
                                            Kılavuz: {evaluation.guideName || 'N/A'}
                                        </Text>
                                        <Text style={styles.reference}>
                                            Referans: {evaluation.minValue.toFixed(2) || 'N/A'} - {evaluation.maxValue.toFixed(2) || 'N/A'}
                                        </Text>
                                        <Divider style={{ marginVertical: 5 }} />
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.noEvaluation}>Değerlendirme bulunamadı.</Text>
                        )}
                    </View>
                ))
            ) : (
                <Text style={styles.noTest}>Test bulunamadı.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    testContainer: {
        marginVertical: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        padding: 10,
    },
    testName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    testValue: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    evaluationContainer: {
        marginVertical: 5,
    },
    guideName: {
        fontSize: 14,
        color: '#555',
    },
    reference: {
        fontSize: 14,
        color: '#555',
    },
    noEvaluation: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#777',
    },
    noTest: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#777',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    statusText: {
        fontSize: 16,
        marginLeft: 5,
        fontWeight: 'bold',
    },
});

export default TestResultItem;
