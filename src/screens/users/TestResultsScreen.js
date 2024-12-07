// ./src/screens/users/TestResultsScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

// Durum ikonu ve renkini belirleyen fonksiyon
const getStatusInfo = (status) => {
    switch (status) {
        case 'Yüksek':
            return { icon: '↑', color: '#ff4d4f' }; // kırmızı
        case 'Düşük':
            return { icon: '↓', color: '#faad14' }; // turuncu
        case 'Normal':
            return { icon: '→', color: '#52c41a' }; // yeşil
        default:
            return { icon: '', color: '#000' };
    }
};

const TestResultsScreen = () => {
    const { user } = useContext(AuthContext);
    const [testResults, setTestResults] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [filteredResults, setFilteredResults] = useState([]);

    useEffect(() => {
        const fetchTestResults = async () => {
            if (!user || !user.uid) return;

            // Kullanıcı bilgilerini almak için kullanıcı dokümanını çekiyoruz
            // TC no çekip testResults sorgusu yapacağız.
            const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
            let patientTc = null;
            userDoc.forEach((docSnap) => {
                if (docSnap.exists()) {
                    patientTc = docSnap.data().tcNo;
                }
            });

            if (!patientTc) return;

            // testResults koleksiyonundan bu kullanıcıya ait sonuçları çek
            const q = query(collection(db, 'testResults'), where('patientTc', '==', patientTc));
            const querySnapshot = await getDocs(q);
            const resultsData = querySnapshot.docs.map(doc => doc.data());

            // resultsData içindeki "tests" alanından test detaylarını çıkaracağız
            // Yapı:
            // {
            //   patientTc: "12345678901",
            //   testDate: "2024-12-01",
            //   tests: [
            //     {
            //       testName: "IgA",
            //       testValue: 3.5,
            //       guideEvaluations: [...]
            //     },
            //     ...
            //   ]
            // }

            let allTests = [];
            resultsData.forEach(result => {
                result.tests.forEach(t => {
                    // guideEvaluations içinden ilkini veya tümünü gösterebilirsiniz.
                    // Burada basitlik için ilk rehberi baz alacağız.
                    const evalInfo = t.guideEvaluations && t.guideEvaluations.length > 0 ? t.guideEvaluations[0] : null;
                    const status = evalInfo ? evalInfo.status : null;
                    allTests.push({
                        testName: t.testName,
                        testValue: t.testValue,
                        testDate: result.testDate,
                        status: status,
                    });
                });
            });

            setTestResults(allTests);
            setFilteredResults(allTests);
        };

        fetchTestResults();
    }, [user]);

    useEffect(() => {
        // Filtre uygulama
        if (filterText.trim() === '') {
            setFilteredResults(testResults);
        } else {
            const filtered = testResults.filter(item =>
                item.testName.toLowerCase().includes(filterText.toLowerCase())
            );
            setFilteredResults(filtered);
        }
    }, [filterText, testResults]);

    const renderItem = ({ item }) => {
        const { icon, color } = getStatusInfo(item.status);
        return (
            <View style={styles.resultItem}>
                <Text style={styles.resultDate}>{item.testDate}</Text>
                <Text style={styles.testName}>{item.testName}</Text>
                <Text style={styles.testValue}>Değer: {item.testValue}</Text>
                {item.status && (
                    <Text style={[styles.statusText, { color: color }]}>
                        Durum: {item.status} {icon}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tahlil Sonuçları</Text>
            <TextInput
                style={styles.input}
                placeholder="Tetkik türü ara (örn: IgA, IgM...)"
                value={filterText}
                onChangeText={setFilterText}
            />
            <FlatList
                data={filteredResults}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.noDataText}>Sonuç bulunamadı.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#3f51b5',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    resultItem: {
        backgroundColor: '#f2f6ff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    resultDate: {
        fontSize: 14,
        marginBottom: 5,
        color: '#555',
    },
    testName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    testValue: {
        fontSize: 16,
        marginVertical: 5,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TestResultsScreen;
