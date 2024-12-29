// UserGraphScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity
} from 'react-native';

import { db } from '../../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
    Card,
    Text,
    ActivityIndicator,
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
    Normal: 'green',
    Yüksek: 'red',
    Düşük: 'orange',
    'N/A': 'gray',
};

/** guide.status'e göre ikon seçimi */
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
 * Son iki değeri kıyaslayarak artış, azalış veya değişmeme ikonunu döndürür.
 * Değer yoksa null döner.
 */
const getTrendIcon = (currentValue, previousValue) => {
    if (previousValue == null || currentValue == null) {
        return { iconName: 'remove', color: 'gray' }; // veri yok
    }

    if (currentValue > previousValue) {
        return { iconName: 'arrow-up-circle', color: 'red' }; // artma
    } else if (currentValue < previousValue) {
        return { iconName: 'arrow-down-circle', color: 'green' }; // azalma
    } else {
        return { iconName: 'remove', color: 'gray' }; // değişmeme
    }
};

const getColorForStatus = (status) => {
    return STATUS_COLORS[status] || 'gray';
};

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
                        // --> majority'e göre statü
                        const majority = getMajorityStatus(guideEvaluations);

                        // Bu testName daha önce kaydedilmediyse dizisini oluştur
                        if (!tempGrouped[testName]) {
                            tempGrouped[testName] = [];
                        }
                        // Veriyi pushla
                        tempGrouped[testName].push({
                            x: testDate,
                            y: parseFloat(testValue.toFixed(2)) || 0,
                            status: majority,  // <-- majority
                            guideEvaluations: guideEvaluations || [], // Klavuz bilgilerini de sakla
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

            {Object.entries(groupedData).map(([testName, dataArray]) => {

                // Ekran genişliği
                const screenWidth = Dimensions.get('window').width;

                // Grafikte hangi tarihleri ve değerleri göstereceğiz?
                // Label olarak tarih (gg/aa), data olarak y.
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
                    const sign = fark > 0 ? '+' : fark < 0 ? '' : '';
                    degisimText = `${sign}${fark.toFixed(2)}`;
                }

                // Son tahlil kaydı
                const lastRecord = dataArray[dataArray.length - 1];

                // **** CHART DATA ****
                const chartData = {
                    labels: labels,
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
                            // Sağ tarafta trend oku gösterelim
                            right={() => (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.diffText}>{degisimText}</Text>
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
                            <Text style={styles.infoText}>
                                <Ionicons name="calendar" size={16} color="#333" />{' '}
                                Tarih: {lastRecord?.x}
                            </Text>

                            {/* Son girilen değer */}
                            <Text style={styles.infoText}>
                                <Ionicons name="flask" size={16} color="#333" />{' '}
                                Girilen Değer: {lastRecord?.y.toFixed(2)} g/L
                                {'  '}({(lastRecord?.y * 1000).toFixed(2)} mg/L)
                            </Text>

                            <Divider style={styles.divider} />

                            {/* guideEvaluations detayları (son kayda ait) */}
                            {lastRecord?.guideEvaluations && lastRecord.guideEvaluations.length > 0 ? (
                                lastRecord.guideEvaluations.map((guide, idx) => {
                                    // Her bir klavuzun statüsüne göre farklı ok
                                    const iconData = getStatusIcon(guide.status);

                                    return (
                                        <View key={idx} style={{ marginBottom: 10 }}>
                                            <Text style={styles.guideText}>
                                                <Ionicons name="book" size={14} color="#333" /> Klavuz Adı: {guide.guideName}
                                            </Text>
                                            <Text style={styles.guideText}>
                                                Referans Aralığı:{' '}
                                                {(guide.minValue || 0).toFixed(2)} {guide.unit} - {(guide.maxValue || 0).toFixed(2)} {guide.unit}
                                            </Text>

                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[styles.statusText, { color: getColorForStatus(guide.status) }]}>
                                                    Statü: {guide.status}
                                                </Text>
                                                {/* Renklendirilmiş bir ok ikonu */}
                                                <Ionicons
                                                    name={iconData.name}
                                                    size={16}
                                                    color={iconData.color}
                                                    style={{ marginLeft: 8 }}
                                                />
                                            </View>
                                            <Divider style={styles.smallDivider} />
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={styles.guideText}>Klavuz bilgisi bulunamadı.</Text>
                            )}

                            {/* ARTIK GRAFİK */}
                            <ScrollView horizontal={true}>
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
                                        // Düğümleri majority statüsüne göre boyar
                                        renderDotContent={({ x, y, index }) => {
                                            // Grafiğin her noktası için dataArray[index] kaydını al
                                            const item = dataArray[index];
                                            if (!item) return null;
                                            // item.status = majority statü
                                            const dotColor = getColorForStatus(item.status);
                                            return (
                                                <View
                                                    key={index}
                                                    style={{
                                                        position: 'absolute',
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: 8,
                                                        left: x - 8,
                                                        top: y - 8,
                                                        backgroundColor: dotColor,
                                                        borderWidth: 1,
                                                        borderColor: '#fff',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                />
                                            );
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
    infoText: {
        fontSize: 14,
        marginVertical: 4,
        color: '#333',
        fontWeight: 'bold',
    },
    divider: {
        marginVertical: 8,
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
    diffText: {
        fontSize: 14,
        color: '#333',
    },
});
