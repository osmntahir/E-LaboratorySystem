// src/screens/users/UserGraphScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, Text, ActivityIndicator, Divider } from 'react-native-paper';
import {
    VictoryChart,
    VictoryScatter,
    VictoryAxis,
    VictoryTooltip,
    VictoryContainer,
    VictoryLine
} from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

/** Durum-renk eşleşmesi */
const STATUS_COLORS = {
    Normal: 'green',
    Yüksek: 'red',
    Düşük: 'orange',
    'N/A': 'gray',
};

/**
 * Majority rule: guideEvaluations içindeki status değerlerini sayar,
 * en çok tekrar eden status'ü döndürür.
 */
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

/**
 * Kullanıcı tahlillerini, testName bazında gruplayıp Card + VictoryLine + VictoryScatter şeklinde gösterir.
 */
const UserGraphScreen = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [groupedData, setGroupedData] = useState({});

    useFocusEffect(
        React.useCallback(() => {
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
                        const { testName, testValue, guideEvaluations } = testItem;
                        const majority = getMajorityStatus(guideEvaluations);

                        if (!tempGrouped[testName]) {
                            tempGrouped[testName] = [];
                        }
                        tempGrouped[testName].push({
                            x: testDate,
                            y: testValue || 0,
                            status: majority,
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

    const getColorForStatus = (status) => {
        return STATUS_COLORS[status] || 'gray';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator animating={true} size="large" />
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
            <Text style={styles.title}>Tahlil Geçmişi</Text>
            <Text style={styles.subTitle}>
                {user?.name} {user?.surname} (TC: {user?.tcNo})
            </Text>

            {Object.entries(groupedData).map(([testName, dataArray]) => (
                <Card style={styles.card} key={testName}>
                    <Card.Title title={testName} titleStyle={styles.cardTitle} />
                    <Card.Content>
                        {/* Liste Bölümü */}
                        {dataArray.map((item, idx) => (
                            <View key={idx} style={styles.resultRow}>
                                <Text style={styles.resultText}>Tarih: {item.x}</Text>
                                <Text style={styles.resultText}>Değer: {item.y}</Text>
                                <Text style={[styles.statusText, { color: getColorForStatus(item.status) }]}>
                                    {item.status}
                                </Text>
                                <Divider style={{ marginVertical: 6 }} />
                            </View>
                        ))}

                        {/* Grafik Bölümü */}
                        <View style={styles.graphContainer}>
                            <VictoryChart
                                width={350}
                                height={250}
                                domainPadding={{ x: 40, y: 20 }}
                                containerComponent={<VictoryContainer />}
                            >
                                <VictoryAxis
                                    tickFormat={(t) => {
                                        // t: "YYYY-MM-DD HH:mm"
                                        const d = new Date(t);
                                        if (isNaN(d)) return t; // Geçersiz tarih ise orijinal string
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const day = String(d.getDate()).padStart(2, '0');
                                        return `${month}/${day}`;
                                    }}
                                    style={{
                                        tickLabels: { fontSize: 10, angle: 45 },
                                    }}
                                />
                                <VictoryAxis
                                    dependentAxis
                                    tickFormat={(t) => t.toFixed(1)}
                                    style={{
                                        tickLabels: { fontSize: 10 },
                                    }}
                                />

                                {/* VictoryLine - Parabolik/Lineer Trend */}
                                <VictoryLine
                                    interpolation="monotoneX"
                                    style={{
                                        data: {
                                            stroke: '#3f51b5',
                                            strokeWidth: 2,
                                        },
                                    }}
                                    data={dataArray.map((d) => ({
                                        x: d.x,
                                        y: d.y,
                                    }))}
                                    x="x"
                                    y="y"
                                />

                                {/* VictoryScatter - Noktalar */}
                                <VictoryScatter
                                    data={dataArray.map((d) => ({
                                        ...d,
                                        y: parseFloat(d.y.toFixed(2)), // 2 basamak
                                    }))}
                                    x="x"
                                    y="y"
                                    size={5}
                                    style={{
                                        data: {
                                            fill: ({ datum }) => getColorForStatus(datum.status),
                                        },
                                    }}
                                    labels={({ datum }) => {
                                        // Tooltip içeriği
                                        const dateObj = new Date(datum.x);
                                        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                                        const dd = String(dateObj.getDate()).padStart(2, '0');
                                        const hh = String(dateObj.getHours()).padStart(2, '0');
                                        const min = String(dateObj.getMinutes()).padStart(2, '0');
                                        return `Tarih: ${mm}/${dd} ${hh}:${min}\nDeğer: ${datum.y}\nDurum: ${datum.status}`;
                                    }}
                                    labelComponent={
                                        <VictoryTooltip
                                            renderInPortal={false}
                                            flyoutWidth={140}
                                            flyoutHeight={80}
                                            style={{ fontSize: 10 }}
                                        />
                                    }
                                />
                            </VictoryChart>
                        </View>
                    </Card.Content>
                </Card>
            ))}
        </ScrollView>
    );
};

export default UserGraphScreen;

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
    },
    cardTitle: {
        fontSize: 18,
        color: '#3f51b5',
    },
    resultRow: {
        marginVertical: 6,
    },
    resultText: {
        fontSize: 14,
        color: '#333',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5,
    },
    graphContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
});
