// PatientGraphScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, Text, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

// ***** REACT-NATIVE-CHART-KIT *****
import { LineChart } from 'react-native-chart-kit';

// Ekran genişliği
const screenWidth = Dimensions.get('window').width;

/**
 * Son iki değeri kıyaslayarak artış, azalış veya değişmeme ikonunu döndürür.
 * Değer yoksa null döner.
 */
const getTrendIcon = (currentValue, previousValue) => {
    if (previousValue == null || currentValue == null) {
        return { iconName: 'remove-circle', color: 'gray' }; // Veri yok
    }

    if (currentValue > previousValue) {
        return { iconName: 'arrow-up-circle', color: 'red' }; // Artma
    } else if (currentValue < previousValue) {
        return { iconName: 'arrow-down-circle', color: 'orange' }; // Azalma
    } else {
        return { iconName: 'remove-circle', color: 'gray' }; // Değişmeme
    }
};

const PatientGraphScreen = ({ route }) => {
    const { patient } = route.params; // Route ile gelen hasta bilgisi
    const [loading, setLoading] = useState(true);
    const [groupedData, setGroupedData] = useState({});

    useFocusEffect(
        useCallback(() => {
            fetchTestResults();
        }, [])
    );

    const fetchTestResults = async () => {
        if (!patient || !patient.tcNo) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            // Firestore: Bu hastaya ait testResults
            const q = query(
                collection(db, 'testResults'),
                where('patientTc', '==', patient.tcNo)
            );
            const querySnapshot = await getDocs(q);

            let tempGrouped = {};

            querySnapshot.forEach((docSnap) => {
                const result = docSnap.data();
                const testDate = result?.testDate || ''; // "YYYY-MM-DD HH:mm"

                if (Array.isArray(result.tests)) {
                    result.tests.forEach((testItem) => {
                        const { testName, testValue } = testItem;

                        if (!tempGrouped[testName]) {
                            tempGrouped[testName] = [];
                        }
                        tempGrouped[testName].push({
                            x: testDate,
                            y: parseFloat(testValue.toFixed(2)) || 0,
                        });
                    });
                }
            });

            // Tarih bazında sıralama
            Object.keys(tempGrouped).forEach((testName) => {
                tempGrouped[testName].sort((a, b) => {
                    const dateA = new Date(a.x);
                    const dateB = new Date(b.x);
                    return dateA - dateB;
                });
            });

            setGroupedData(tempGrouped);
        } catch (error) {
            console.log('PatientGraphScreen fetch error:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3f51b5" />
            </View>
        );
    }

    // Hiç sonuç yoksa
    if (Object.keys(groupedData).length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>Tahlil sonuçları bulunamadı.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Başlık */}
            <View style={styles.header}>
                <Ionicons name="flask" size={30} color="#3f51b5" />
                <Text style={styles.title}>Hasta Grafik Ekranı</Text>
            </View>
            <Text style={styles.subTitle}>
                <Ionicons name="person" size={16} color="#333" />{' '}
                {patient?.name} {patient?.surname} (TC: {patient?.tcNo})
            </Text>

            {/* Her testName için bir Card render ediyoruz */}
            {Object.entries(groupedData).map(([testName, dataArray]) => {
                // Son iki değere bakarak trend oku
                const lastValue = dataArray[dataArray.length - 1]?.y || null;
                const prevValue = dataArray.length > 1
                    ? dataArray[dataArray.length - 2]?.y
                    : null;
                const trend = getTrendIcon(lastValue, prevValue);

                // Değişim miktarı
                let degisimText = '';
                if (prevValue != null && lastValue != null) {
                    const fark = lastValue - prevValue;
                    const sign = fark > 0 ? '+' : fark < 0 ? '' : '';
                    degisimText = `${sign}${fark.toFixed(2)}`;
                }

                // Son kayıt
                const lastRecord = dataArray[dataArray.length - 1];
                const chartLabels = dataArray.map((item) => {
                    const d = new Date(item.x);
                    if (isNaN(d.getTime())) return item.x; // Geçersizse orijinal string
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    return `${day}/${month}`;
                });
                const chartValues = dataArray.map((item) => item.y);

                const chartData = {
                    labels: chartLabels,
                    datasets: [
                        {
                            data: chartValues,
                        },
                    ],
                };

                return (
                    <Card style={styles.card} key={testName}>
                        {/* Kart Başlık */}
                        <Card.Title
                            title={
                                <View style={styles.cardTitleContainer}>
                                    <Ionicons name="flask" size={20} color="#3f51b5" style={{ marginRight: 8 }} />
                                    <Text style={styles.cardTitle}>{testName}</Text>
                                    <Text style={[styles.diffText, { color: trend.color }]}>
                                        {degisimText}
                                    </Text>
                                    <Ionicons
                                        name={trend.iconName}
                                        size={20}
                                        color={trend.color}
                                        style={{ marginLeft: 5 }}
                                    />
                                </View>
                            }
                        />

                        <Card.Content>
                            {/* Tahlil Sonuçları Listesi */}
                            <View style={styles.resultsList}>
                                {dataArray.map((item, index) => (
                                    <View key={index} style={styles.resultItem}>
                                        <View style={styles.resultInfo}>
                                            <Ionicons name="calendar" size={16} color="#555" style={styles.iconStyle} />
                                            <Text style={styles.resultText}>Tarih: {item.x}</Text>
                                        </View>
                                        <View style={styles.resultInfo}>
                                            <Ionicons name="flask" size={16} color="#555" style={styles.iconStyle} />
                                            <Text style={styles.resultText}>
                                                Değer: {item.y.toFixed(2)} g/L {'  '}
                                                ({(item.y * 1000).toFixed(2)} mg/L)
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <Divider style={styles.divider} />

                            {/* Grafik */}
                            <ScrollView horizontal={true} style={styles.graphScroll}>
                                <View style={{ width: Math.max(chartLabels.length * 60, screenWidth - 40) }}>
                                    <LineChart
                                        data={chartData}
                                        width={Math.max(chartLabels.length * 60, screenWidth - 40)}
                                        height={220}
                                        yAxisSuffix=""
                                        yAxisInterval={1}
                                        chartConfig={{
                                            backgroundColor: '#fff',
                                            backgroundGradientFrom: '#f2f6ff',
                                            backgroundGradientTo: '#f2f6ff',
                                            decimalPlaces: 2,
                                            color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            style: {
                                                borderRadius: 16,
                                            },
                                            propsForDots: {
                                                r: '4',
                                                strokeWidth: '2',
                                                stroke: '#3f51b5',
                                            },
                                        }}
                                        bezier
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
                                        // Düğümleri default renkte göster
                                        renderDotContent={({ x, y, index }) => null}
                                    />
                                </View>
                            </ScrollView>
                        </Card.Content>
                    </Card>
                );
            })}
        </ScrollView>
    );

};

export default PatientGraphScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 18,
        color: '#777',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        color: '#3f51b5',
        fontWeight: '700',
        marginLeft: 10,
    },
    subTitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 25,
        textAlign: 'center',
        fontWeight: '500',
    },
    card: {
        marginHorizontal: 5,
        marginBottom: 25,
        borderRadius: 12,
        backgroundColor: '#fff',
        elevation: 3,
        overflow: 'hidden',
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        color: '#3f51b5',
        fontWeight: '700',
    },
    diffText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    iconStyle: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        marginVertical: 10,
        backgroundColor: '#e0e0e0',
    },
    graphScroll: {
        marginTop: 15,
    },
    resultsList: {
        marginBottom: 12,
    },
    resultItem: {
        marginBottom: 10,
    },
    resultInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultText: {
        fontSize: 16,
        color: '#555',
        fontWeight: '400',
    },
});
