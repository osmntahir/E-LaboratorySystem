// UserGraphScreen.js
import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator
} from 'react-native';

import { db } from '../../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
    Card,
    Text,
    Divider
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

// ***** İkonlar (örn: Ionicons) *****
import Ionicons from 'react-native-vector-icons/Ionicons';

// ***** REACT-NATIVE-CHART-KIT *****
import { LineChart } from 'react-native-chart-kit';

/** Durum-renk eşleşmesi */
const STATUS_COLORS = {
    Artış: 'red',
    Azalış: 'green',
    'Değişmeme': 'gray',
};

/**
 * Son iki değeri kıyaslayarak artış, azalış veya değişmeme ikonunu döndürür.
 * Değer yoksa null döner.
 */
const getTrendIcon = (currentValue, previousValue) => {
    if (previousValue == null || currentValue == null) {
        return { iconName: 'remove-circle', color: 'gray' }; // Veri yok
    }

    if (currentValue > previousValue) {
        return { iconName: 'arrow-up-circle', color: 'red' }; // Artış
    } else if (currentValue < previousValue) {
        return { iconName: 'arrow-down-circle', color: 'green' }; // Azalış
    } else {
        return { iconName: 'remove-circle', color: 'gray' }; // Değişmeme
    }
};

const UserGraphScreen = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [groupedData, setGroupedData] = useState({});

    // Ekran genişliği
    const screenWidth = Dimensions.get('window').width;

    useFocusEffect(
        useCallback(() => {
            fetchTestResults();
        }, [])
    );

    const fetchTestResults = async () => {
        if (!user?.tcNo) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            // Firestore: Bu kullanıcıya ait tahlil sonuçlarını çek
            const q = query(collection(db, 'testResults'), where('patientTc', '==', user.tcNo));
            const querySnapshot = await getDocs(q);

            let tempGrouped = {}; // testName bazında verileri tutacağımız obje

            querySnapshot.forEach((docSnap) => {
                const result = docSnap.data();
                const testDate = result?.testDate || ''; // Tarih formatı: "YYYY-MM-DD HH:mm"

                if (Array.isArray(result.tests)) {
                    result.tests.forEach((testItem) => {
                        const { testName, testValue } = testItem;

                        if (!tempGrouped[testName]) {
                            tempGrouped[testName] = [];
                        }
                        // Veriyi pushla
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
            console.log('UserGraphScreen fetch error:', error);
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="large" color="#3f51b5" />
            </View>
        );
    }

    // Eğer hiç sonuç yoksa
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
                <Ionicons name="bar-chart" size={30} color="#3f51b5" />
                <Text style={styles.title}>Tahlil Geçmişi</Text>
            </View>
            <Text style={styles.subTitle}>
                {user?.name} {user?.surname} (TC: {user?.tcNo})
            </Text>

            {Object.entries(groupedData).map(([testName, dataArray]) => {

                // Grafikte hangi tarihleri ve değerleri göstereceğiz?
                const labels = dataArray.map((item) => {
                    const d = new Date(item.x);
                    if (isNaN(d.getTime())) return item.x;
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    return `${day}/${month}`;
                });

                const chartValues = dataArray.map((item) => item.y);

                // Son iki değere bakarak trend oku
                const lastValue = dataArray[dataArray.length - 1]?.y || null;
                const prevValue =
                    dataArray.length > 1 ? dataArray[dataArray.length - 2]?.y : null;
                const trend = getTrendIcon(lastValue, prevValue);

                // Değişim miktarı
                let degisimText = '';
                if (prevValue != null && lastValue != null) {
                    const fark = lastValue - prevValue;
                    // + ve - işaretiyle gösterelim
                    const sign = fark > 0 ? '+' : fark < 0 ? '-' : '';
                    degisimText = `${sign}${Math.abs(fark).toFixed(2)}`;
                }

                // Son tahlil kaydı
                const lastRecord = dataArray[dataArray.length - 1];

                // **** CHART DATA ****
                const chartData = {
                    labels: labels,
                    datasets: [
                        {
                            data: chartValues,
                            color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`, // çizgi rengi
                            strokeWidth: 2, // çizgi kalınlığı
                        },
                    ],
                };

                return (
                    <Card style={styles.card} key={testName}>
                        {/* Kart Başlık */}
                        <Card.Title
                            title={testName}
                            titleStyle={styles.cardTitle}
                            left={() => (
                                <Ionicons name="flask" size={24} color="#3f51b5" style={{ marginRight: 8 }} />
                            )}
                            // Sağ tarafta trend oku gösterelim
                            right={() => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.diffText, { color: trend.color }]}>{degisimText}</Text>
                                    <Ionicons
                                        name={trend.iconName}
                                        size={24}
                                        color={trend.color}
                                        style={{ marginRight: 10, marginLeft: 5 }}
                                    />
                                </View>
                            )}
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
                                {/* Chart genişliği: veri sayısına göre ya da en az ekran genişliği kadar. */}
                                <View style={{ width: Math.max(labels.length * 60, screenWidth - 40) }}>
                                    <LineChart
                                        data={chartData}
                                        width={Math.max(labels.length * 60, screenWidth - 40)}
                                        height={220}
                                        yAxisSuffix=""
                                        yAxisInterval={1}
                                        chartConfig={{
                                            backgroundColor: '#fff',
                                            backgroundGradientFrom: '#f2f6ff',
                                            backgroundGradientTo: '#f2f6ff',
                                            decimalPlaces: 2, // toFixed(2)
                                            color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`, // #3f51b5
                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            style: {
                                                borderRadius: 16,
                                            },
                                            propsForDots: {
                                                r: '4', // Düğümlerin yarıçapı
                                                strokeWidth: '2',
                                                stroke: '#3f51b5',
                                            },
                                        }}
                                        bezier
                                        style={{
                                            marginVertical: 8,
                                            borderRadius: 16,
                                        }}
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

export default UserGraphScreen;

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
    cardTitle: {
        fontSize: 20,
        color: '#3f51b5',
        fontWeight: '700',
    },
    diffText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    infoText: {
        fontSize: 16,
        marginVertical: 4,
        color: '#333',
        fontWeight: '500',
    },
    divider: {
        marginVertical: 10,
        backgroundColor: '#e0e0e0',
    },
    smallDivider: {
        marginVertical: 4,
    },
    guideText: {
        fontSize: 14,
        color: '#444',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
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
    iconStyle: {
        marginRight: 8,
    },
});
