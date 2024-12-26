import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import {
    Text,
    TextInput,
    Button,
    Card,
    Divider,
    Portal,
    Modal,
    Avatar,
    IconButton,
    TouchableRipple,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { calculateAgeInMonths } from '../../utils/ageCalculator';
import TEST_TYPES from '../../constants/testTypes'; // Adjust the path as necessary

const STATUS_COLORS = {
    Normal: '#52c41a',
    Yüksek: '#ff4d4f',
    Düşük: '#faad14',
    'N/A': 'gray',
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'Yüksek':
            return { icon: 'arrow-up-bold', color: STATUS_COLORS.Yüksek };
        case 'Düşük':
            return { icon: 'arrow-down-bold', color: STATUS_COLORS.Düşük };
        case 'Normal':
            return { icon: 'check', color: STATUS_COLORS.Normal };
        default:
            return { icon: 'help', color: STATUS_COLORS['N/A'] };
    }
};

const TestAnalysisScreen = () => {
    const [testTypes] = useState(TEST_TYPES);
    const [testValues, setTestValues] = useState({});
    const [birthDate, setBirthDate] = useState(null);
    const [ageInMonths, setAgeInMonths] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleValueChange = (testName, value) => {
        setTestValues((prev) => ({ ...prev, [testName]: value }));
    };

    const handleSearch = async () => {
        if (!birthDate) {
            alert('Lütfen doğum tarihini seçiniz.');
            return;
        }

        if (isNaN(ageInMonths)) {
            alert('Geçerli bir doğum tarihi giriniz.');
            return;
        }

        if (Object.keys(testValues).length === 0) {
            alert('Lütfen en az bir test değeri giriniz.');
            return;
        }

        setIsLoading(true);

        try {
            const guidesSnapshot = await getDocs(collection(db, 'guides'));
            const tempResults = {};

            guidesSnapshot.forEach((guideDoc) => {
                const guideData = guideDoc.data();
                if (!Array.isArray(guideData.testTypes)) {
                    return;
                }

                guideData.testTypes.forEach((test) => {
                    const testName = test.name;
                    if (!testValues[testName]) {
                        return;
                    }

                    if (!Array.isArray(test.ageGroups)) {
                        return;
                    }

                    const testValue = parseFloat(testValues[testName]);
                    if (isNaN(testValue)) {
                        return;
                    }

                    let adjustedTestValue = testValue;
                    if (guideData.unit === 'mg/L') {
                        adjustedTestValue *= 1000;
                    }

                    test.ageGroups.forEach((ageGroup) => {
                        const [minAge, maxAge] = ageGroup.ageRange.split('-').map(Number);

                        if (ageInMonths >= minAge && ageInMonths <= maxAge) {
                            let status = 'Normal';
                            if (adjustedTestValue < ageGroup.minValue) {
                                status = 'Düşük';
                            } else if (adjustedTestValue > ageGroup.maxValue) {
                                status = 'Yüksek';
                            }

                            if (!tempResults[testName]) {
                                tempResults[testName] = {
                                    enteredValue: testValue,
                                    unit: 'g/L',
                                    equivalents: [],
                                };
                            }

                            tempResults[testName].equivalents.push({
                                guideName: guideData.name,
                                minValue: ageGroup.minValue,
                                maxValue: ageGroup.maxValue,
                                status,
                                unit: guideData.unit || 'g/L',
                            });
                        }
                    });
                });
            });

            setResults(tempResults);
        } catch (error) {
            console.error('Error searching test in guides:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthDate(selectedDate);
            const ageMonths = calculateAgeInMonths(selectedDate.toISOString());
            setAgeInMonths(ageMonths);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            <Card style={styles.headerCard}>
                <Card.Title
                    title="Test Analizi"
                    subtitle="Sağlığınızı Yakından Takip Edin"
                    left={(props) => <IconButton {...props} icon="test-tube" color="#fff" />}
                    titleStyle={styles.headerTitle}
                    subtitleStyle={styles.headerSubtitle}
                />
            </Card>

            <Card style={styles.inputCard}>
                <Card.Content>
                    <TouchableRipple onPress={showDatePickerModal} style={styles.datePicker}>
                        <View style={styles.datePickerContainer}>
                            <Text style={styles.datePickerLabel}>Doğum Tarihi</Text>
                            <Text style={styles.datePickerText}>
                                {birthDate ? birthDate.toLocaleDateString() : 'Tarih Seçiniz'}
                            </Text>
                        </View>
                    </TouchableRipple>
                    {showDatePicker && (
                        <DateTimePicker
                            value={birthDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            maximumDate={new Date()}
                            style={styles.dateTimePicker}
                        />
                    )}
                    <View style={styles.inputsContainer}>
                        {testTypes.map((test) => (
                            <TextInput
                                key={test.id}
                                mode="outlined"
                                label={`${test.name} Değeri (g/L)`}
                                style={styles.input}
                                keyboardType="numeric"
                                value={testValues[test.name] || ''}
                                onChangeText={(value) => handleValueChange(test.name, value)}
                            />
                        ))}
                    </View>
                    <Button mode="contained" onPress={handleSearch} style={styles.button}>
                        Sonuç Hesapla
                    </Button>
                </Card.Content>
            </Card>

            <Divider style={{ marginVertical: 20 }} />

            <Text style={styles.resultHeader}>Sonuçlar</Text>

            {isLoading ? (
                <ActivityIndicator size="large" color="#3f51b5" style={{ marginTop: 20 }} />
            ) : Object.keys(results).length === 0 ? (
                <Text style={styles.noResultText}>Sonuç bulunamadı.</Text>
            ) : (
                Object.keys(results).map((testName, index) => {
                    const test = results[testName];
                    return (
                        <Card key={index} style={styles.resultCard}>
                            <Card.Content>
                                <View style={styles.resultHeaderContainer}>
                                    <Avatar.Icon
                                        size={40}
                                        icon="test-tube"
                                        style={{ backgroundColor: '#3f51b5' }}
                                        color="#fff"
                                    />
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={styles.resultTestName}>{testName}</Text>
                                        <Text style={styles.resultEnteredValue}>
                                            Değer: {test.enteredValue} g/L     {test.enteredValue * 1000} mg/L
                                        </Text>
                                    </View>
                                </View>
                                <Divider style={{ marginVertical: 10 }} />
                                {test.equivalents.map((equiv, idx) => {
                                    const { icon, color } = getStatusIcon(equiv.status);
                                    return (
                                        <View key={idx} style={styles.equivalentContainer}>
                                            <View style={styles.equivalentHeader}>
                                                <Avatar.Icon
                                                    size={24}
                                                    icon="book-open-page-variant"
                                                    color="#fff"
                                                    style={{ backgroundColor: '#3f51b5', marginRight: 5 }}
                                                />
                                                <Text style={styles.equivalentGuideName}>{equiv.guideName}</Text>
                                            </View>
                                            <Text style={styles.equivalentReference}>
                                                Referans: {equiv.minValue} {equiv.unit} - {equiv.maxValue} {equiv.unit}
                                            </Text>
                                            <View style={styles.statusRow}>
                                                <Avatar.Icon
                                                    size={20}
                                                    icon={icon}
                                                    color="#fff"
                                                    style={{ backgroundColor: color, marginRight: 5 }}
                                                />
                                                <Text style={[styles.statusText, { color }]}>{equiv.status}</Text>
                                            </View>
                                            {idx !== test.equivalents.length - 1 && <Divider style={{ marginVertical: 5 }} />}
                                        </View>
                                    );
                                })}
                            </Card.Content>
                        </Card>
                    );
                })
            )}

            <Portal>
                <Modal visible={isLoading} dismissable={false}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator animating={true} size="large" color="#3f51b5" />
                        <Text style={styles.loadingText}>Hesaplama yapılıyor...</Text>
                    </View>
                </Modal>
            </Portal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 10,
    },
    headerCard: {
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#3f51b5',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#fff',
        fontSize: 14,
    },
    inputCard: {
        marginBottom: 20,
        borderRadius: 10,
    },
    datePicker: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    datePickerContainer: {
        flexDirection: 'column',
    },
    datePickerLabel: {
        fontSize: 16,
        color: '#555',
    },
    datePickerText: {
        fontSize: 18,
        color: '#000',
        marginTop: 5,
    },
    dateTimePicker: {
        backgroundColor: '#fff',
    },
    inputsContainer: {
        marginTop: 15, // Added margin to increase spacing
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#3f51b5',
    },
    resultHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: '#3f51b5',
        padding: 10,
        borderRadius: 5,
    },
    noResultText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#777',
        marginTop: 20,
    },
    resultCard: {
        marginBottom: 15,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
    },
    resultHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultTestName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    resultEnteredValue: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    equivalentContainer: {
        marginTop: 10,
    },
    equivalentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    equivalentGuideName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    equivalentReference: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
        marginLeft: 29,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginLeft: 29,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 16,
    },
});

export default TestAnalysisScreen;
