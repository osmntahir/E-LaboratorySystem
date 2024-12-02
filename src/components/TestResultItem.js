// src/components/TestResultItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestResultItem = ({ testResult }) => {
    const tests = testResult.tests || [];

    return (
        <View style={styles.container}>
            <Text style={styles.date}>Tarih: {testResult.testDate || 'N/A'}</Text>
            {tests.length > 0 ? (
                tests.map((test, index) => (
                    <View key={index} style={styles.testContainer}>
                        <Text style={styles.testName}>Test: {test.testName || 'N/A'}</Text>
                        <Text style={styles.testValue}>Değer: {test.testValue || 'N/A'}</Text>
                        {test.guideEvaluations && test.guideEvaluations.length > 0 ? (
                            test.guideEvaluations.map((evaluation, idx) => (
                                <View key={idx} style={styles.evaluationContainer}>
                                    <Text style={styles.guideName}>Kılavuz: {evaluation.guideName || 'N/A'}</Text>
                                    <Text style={styles.status}>Durum: {evaluation.status || 'N/A'}</Text>
                                    <Text style={styles.reference}>Referans: {evaluation.minValue || 'N/A'} - {evaluation.maxValue || 'N/A'}</Text>
                                </View>
                            ))
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
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    testContainer: {
        marginVertical: 10
    },
    testName: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    testValue: {
        fontSize: 16
    },
    evaluationContainer: {
        marginVertical: 5
    },
    guideName: {
        fontSize: 16
    },
    status: {
        fontSize: 16
    },
    reference: {
        fontSize: 16
    },
    noEvaluation: {
        fontSize: 16,
        fontStyle: 'italic'
    },
    noTest: {
        fontSize: 16,
        fontStyle: 'italic'
    }
});

export default TestResultItem;
