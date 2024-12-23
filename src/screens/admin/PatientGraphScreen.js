// PatientGraphScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, Text, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { VictoryChart, VictoryScatter, VictoryAxis, VictoryTooltip, VictoryContainer } from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const widthPerDataPoint = 50; // Her veri noktası için ayrılacak genişlik (px)

const STATUS_COLORS = {
    Normal: 'green',
    Yüksek: 'red',
    Düşük: 'orange',
};

/** Majority rule: guideEvaluations içindeki status değerlerinden en sık tekrar edeni bulur. */
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

const PatientGraphScreen = ({ route }) => {
    const { patient } = route.params;
    const [loading, setLoading] = useState(true);
    const [groupedData, setGroupedData] = useState({});
    const scrollViewRef = useRef(null); // ScrollView için referans

    useFocusEffect(
        React.useCallback(() => {
            fetchTestResults();
        }, [])
    );

    useEffect(() => {
        if (!loading && scrollViewRef.current) {
            // Veriler yüklendikten sonra ScrollView'u en sona kaydır
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [groupedData, loading]);

    const fetchTestResults = async () => {
        if (!patient || !patient.tcNo) return;
        setLoading(true);

        try {
            const q = query(collection(db, 'testResults'), where('patientTc', '==', patient.tcNo));
            const querySnapshot = await getDocs(q);

            const testResultsData = querySnapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));

            let tempGrouped = {};

            testResultsData.forEach((testResult) => {
                const testDate = testResult.testDate;
                if (!Array.isArray(testResult.tests)) return;

                testResult.tests.forEach((testItem) => {
                    const { testName, testValue, guideEvaluations } = testItem;
                    const majority = getMajorityStatus(guideEvaluations);
                    if (!tempGrouped[testName]) tempGrouped[testName] = [];
                    tempGrouped[testName].push({
                        x: testDate,
                        y: parseFloat(testValue.toFixed(2)) || 0, // Y değeri 2 basamağa yuvarlanmış
                        status: majority,
                    });
                });
            });

            // Tarih bazında sıralama
            Object.keys(tempGrouped).forEach((testName) => {
                tempGrouped[testName] = tempGrouped[testName].sort((a, b) => {
                    const dateA = new Date(a.x);
                    const dateB = new Date(b.x);
                    return dateA - dateB;
                });
            });

            setGroupedData(tempGrouped);
        } catch (error) {
            console.error('fetchTestResults error:', error);
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

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 20 }}
            ref={scrollViewRef} // ScrollView'a referans ata
            horizontal={false}
        >
            <Text style={styles.title}>Hasta Grafik Ekranı</Text>
            <Text style={styles.subTitle}>
                {patient?.name} {patient?.surname} - TC: {patient?.tcNo}
            </Text>

            {Object.keys(groupedData).length === 0 && (
                <Text style={styles.noDataText}>Grafik verisi bulunamadı.</Text>
            )}

            {Object.entries(groupedData).map(([testName, dataArray]) => {
                // Dinamik olarak grafiğin genişliğini hesapla
                const chartWidth = Math.max(screenWidth, dataArray.length * widthPerDataPoint);

                return (
                    <Card style={styles.card} key={testName}>
                        <Card.Title
                            title={testName}
                            titleStyle={styles.cardTitle}
                            left={(props) => <IconButton {...props} icon="chart-line" />}
                        />
                        <Card.Content>
                            <Divider style={{ marginBottom: 10 }} />

                            {/* Tarih / Değer / Status listesi */}
                            {dataArray.map((item, idx) => (
                                <View key={idx} style={styles.valueRow}>
                                    <Text style={styles.valueText}>Tarih: {item.x}</Text>
                                    <Text style={styles.valueText}>Değer: {item.y.toFixed(2)}</Text>
                                    <Text style={[styles.statusText, { color: getColorForStatus(item.status) }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            ))}
                            <Divider style={{ marginVertical: 10 }} />

                            {/* Grafiği yatay kaydırmak için dinamik ScrollView */}
                            <ScrollView horizontal={chartWidth > screenWidth}>
                                <View style={{ width: chartWidth, height: 300 }}>
                                    <VictoryChart
                                        width={chartWidth}
                                        height={300}
                                        domainPadding={{ x: 50, y: 20 }}
                                        containerComponent={<VictoryContainer />} // VictoryContainer kullanarak uyarıyı giderdik
                                    >
                                        {/* X Eksenine Tarih + Saat */}
                                        <VictoryAxis
                                            tickFormat={(t) => {
                                                // t formatı "YYYY-MM-DD HH:mm"
                                                const d = new Date(t);
                                                if (isNaN(d.getTime())) return t; // Geçersiz tarihse orijinali dön
                                                const day = String(d.getDate()).padStart(2, '0');
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const hour = String(d.getHours()).padStart(2, '0');
                                                const minute = String(d.getMinutes()).padStart(2, '0');
                                                return `${day}/${month}\n${hour}:${minute}`;
                                            }}
                                            style={{
                                                tickLabels: {
                                                    fontSize: 10,
                                                    padding: 5,
                                                    dy: 10, // x ekseni etiketlerini biraz aşağı kaydır
                                                },
                                            }}
                                        />
                                        {/* Y Eksenine 2 basamak kısaltma */}
                                        <VictoryAxis
                                            dependentAxis
                                            tickFormat={(t) => t.toFixed(2)}
                                            style={{
                                                tickLabels: { fontSize: 10 },
                                            }}
                                        />

                                        <VictoryScatter
                                            // Veriyi 2 basamağa indiriyoruz
                                            data={dataArray.map((d) => ({
                                                ...d,
                                                y: parseFloat(d.y.toFixed(2)),
                                            }))}
                                            x="x"
                                            y="y"
                                            size={5}
                                            labels={({ datum }) => {
                                                // Tooltip yazısı
                                                const dateObj = new Date(datum.x);
                                                const day = String(dateObj.getDate()).padStart(2, '0');
                                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                                const hour = String(dateObj.getHours()).padStart(2, '0');
                                                const minute = String(dateObj.getMinutes()).padStart(2, '0');
                                                return `Tarih: ${day}/${month} ${hour}:${minute}\nDeğer: ${datum.y}\nDurum: ${datum.status}`;
                                            }}
                                            labelComponent={
                                                <VictoryTooltip
                                                    renderInPortal={false} // Uyarıyı önlemek için portal kullanımını devre dışı bıraktık
                                                    flyoutWidth={140}
                                                    flyoutHeight={80}
                                                    style={{ fontSize: 10 }}
                                                />
                                            }
                                            style={{
                                                data: {
                                                    fill: ({ datum }) => getColorForStatus(datum.status),
                                                },
                                            }}
                                        />
                                    </VictoryChart>
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        marginHorizontal: 10,
        marginVertical: 10,
        borderRadius: 10,
    },
    cardTitle: {
        fontSize: 18,
        color: '#3f51b5',
    },
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    valueText: {
        fontSize: 14,
        color: '#333',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 22,
        margin: 10,
        textAlign: 'center',
        color: '#3f51b5',
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 14,
        marginBottom: 5,
        textAlign: 'center',
        color: '#333',
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        marginTop: 20,
    },
});
