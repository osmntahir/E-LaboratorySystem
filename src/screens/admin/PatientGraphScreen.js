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

// Trend oku bulma (son 2 değeri kıyasla)
const getTrendIcon = (currentValue, previousValue) => {
    if (previousValue == null || currentValue == null) {
        return { iconName: 'remove', color: 'gray' }; // veri yok
    }
    if (currentValue > previousValue) {
        return { iconName: 'arrow-up-circle', color: 'red' }; // artma
    } else if (currentValue < previousValue) {
        return { iconName: 'arrow-down-circle', color: 'orange' }; // azalma
    } else {
        return { iconName: 'remove-circle', color: 'gray' }; // değişmeme
    }
};

// Status => Renk eşleşmesi
const STATUS_COLORS = {
    Normal: 'green',
    Yüksek: 'red',
    Düşük: 'orange',
    'N/A': 'gray',
};

// guide.status'e göre ikon seçimi
const getStatusIcon = (status) => {
    switch (status) {
        case 'Yüksek':
            return { name: 'arrow-up-circle', color: 'red' };
        case 'Düşük':
            return { name: 'arrow-down-circle', color: 'orange' };
        case 'Normal':
            return { name: 'arrow-forward-circle', color: 'green' };
        default:
            return { name: 'remove-circle', color: 'gray' };
    }
};

// Majority rule: guideEvaluations içindeki status değerlerini sayar, en çok tekrar edeni döndürür
const getMajorityStatus = (guideEvaluations) => {
    if (!guideEvaluations || guideEvaluations.length === 0) return 'N/A';
    const statusCount = {};
    guideEvaluations.forEach((evaluation) => {
        const s = evaluation.status || 'N/A';
        statusCount[s] = (statusCount[s] || 0) + 1;
    });
    let majorityStatus = null;
    let maxCount = 0;
    Object.keys(statusCount).forEach((key) => {
        if (statusCount[key] > maxCount) {
            maxCount = statusCount[key];
            majorityStatus = key;
        }
    });
    return majorityStatus || 'N/A';
};

const getColorForStatus = (status) => {
    return STATUS_COLORS[status] || 'gray';
};

const PatientGraphScreen = ({ route }) => {
    const { patient } = route.params; // route ile gelen hasta bilgisi
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
            // Firestore: bu hastaya ait testResults
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
                        const { testName, testValue, guideEvaluations } = testItem;
                        // çoğunluk statüsü
                        const majority = getMajorityStatus(guideEvaluations);

                        if (!tempGrouped[testName]) {
                            tempGrouped[testName] = [];
                        }
                        tempGrouped[testName].push({
                            x: testDate,
                            y: parseFloat(testValue.toFixed(2)) || 0,
                            status: majority,
                            guideEvaluations: guideEvaluations || [],
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

    const screenWidthAdjusted = Dimensions.get('window').width;

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
            <Text style={styles.title}>Hasta Grafik Ekranı</Text>
            <Text style={styles.subTitle}>
                <Ionicons name="person" size={16} color="#333" />{' '}
                {patient?.name} {patient?.surname} (TC: {patient?.tcNo})
            </Text>

            {/* Her testName için bir Card render ediyoruz */}
            {Object.entries(groupedData).map(([testName, dataArray]) => {
                // (1) Son iki değere bakarak trend oku
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
                            title={testName}
                            titleStyle={styles.cardTitle}
                            right={() => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.diffText, { color: trend.color }]}>
                                        {degisimText}
                                    </Text>
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
                            {/* Son tahlil tarihi */}
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar" size={16} color="#333" style={styles.iconStyle} />
                                <Text style={styles.infoText}>Tarih: {lastRecord?.x}</Text>
                            </View>

                            {/* Son girilen değer */}
                            <View style={styles.infoRow}>
                                <Ionicons name="flask" size={16} color="#333" style={styles.iconStyle} />
                                <Text style={styles.infoText}>
                                    Girilen Değer: {lastRecord?.y.toFixed(2)} g/L{'  '}
                                    ({(lastRecord?.y * 1000).toFixed(2)} mg/L)
                                </Text>
                            </View>

                            <Divider style={styles.divider} />

                            {/* guideEvaluations detayları */}
                            {lastRecord?.guideEvaluations && lastRecord.guideEvaluations.length > 0 ? (
                                lastRecord.guideEvaluations.map((guide, idx) => {
                                    const iconData = getStatusIcon(guide.status);
                                    return (
                                        <View key={idx} style={styles.guideContainer}>
                                            {/* Kılavuz ismi */}
                                            <View style={styles.guideRow}>
                                                <Ionicons name="book" size={14} color="#333" style={styles.iconStyle} />
                                                <Text style={styles.guideText}>
                                                    Kılavuz Adı: {guide.guideName}
                                                </Text>
                                            </View>

                                            {/* Referans aralığı */}
                                            <View style={styles.guideRow}>
                                                <Ionicons name="analytics" size={14} color="#333" style={styles.iconStyle} />
                                                <Text style={styles.guideText}>
                                                    Referans Aralığı: {(guide.minValue || 0).toFixed(2)} {guide.unit} - {(guide.maxValue || 0).toFixed(2)} {guide.unit}
                                                </Text>
                                            </View>

                                            {/* Statü ve renkli ok */}
                                            <View style={styles.statusRow}>
                                                <Text style={[styles.statusText, { color: getColorForStatus(guide.status) }]}>
                                                    Statü: {guide.status}
                                                </Text>
                                                <Ionicons
                                                    name={iconData.name}
                                                    size={16}
                                                    color={iconData.color}
                                                    style={{ marginLeft: 8 }}
                                                />
                                            </View>
                                            {idx !== lastRecord.guideEvaluations.length - 1 && <Divider style={styles.smallDivider} />}
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.guideText}>Klavuz bilgisi bulunamadı.</Text>
                            )}

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
            }
            )}
        </ScrollView>
    );
};


export default PatientGraphScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
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
        fontSize: 16,
        color: '#777',
    },
    title: {
        fontSize: 22,
        color: '#3f51b5',
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        marginHorizontal: 10,
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 2,
        overflow: 'hidden',
    },
    cardTitle: {
        fontSize: 18,
        color: '#3f51b5',
        fontWeight: 'bold',
    },
    diffText: {
        fontSize: 14,
        color: '#333',
        marginRight: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    iconStyle: {
        marginRight: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    divider: {
        marginVertical: 8,
    },
    smallDivider: {
        marginVertical: 4,
    },
    guideContainer: {
        marginBottom: 10,
    },
    guideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    guideText: {
        fontSize: 14,
        color: '#444',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    graphScroll: {
        marginTop: 10,
    },
});


