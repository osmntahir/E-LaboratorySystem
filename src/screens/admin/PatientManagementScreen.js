import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Picker } from '@react-native-picker/picker';
import TEST_TYPES from '../../constants/testTypes'; // Import TEST_TYPES

const PatientManagementScreen = () => {
    const [tcNo, setTcNo] = useState("");
    const [patient, setPatient] = useState(null);
    const [testType, setTestType] = useState("");
    const [testValue, setTestValue] = useState("");
    const [existingTests, setExistingTests] = useState([]);

    // TC Kimlik No ile kullanıcıyı ara
    const searchPatient = async () => {
        if (!tcNo) {
            Alert.alert("Hata", "Lütfen bir TC Kimlik Numarası girin.");
            return;
        }

        try {
            const q = query(collection(db, "users"), where("tcNo", "==", tcNo));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                Alert.alert("Hata", "Bu TC Kimlik Numarasına ait bir kullanıcı bulunamadı.");
                setPatient(null);
                setExistingTests([]);
                return;
            }

            const patientData = querySnapshot.docs[0].data();
            setPatient(patientData);

            // Kullanıcıya ait mevcut tetkikleri getir
            const testResultsQuery = query(
                collection(db, "testResults"),
                where("patientTc", "==", tcNo)
            );
            const testResultsSnapshot = await getDocs(testResultsQuery);
            const tests = testResultsSnapshot.docs.map(doc => doc.data().testType);
            setExistingTests(tests);
        } catch (error) {
            console.log("Kullanıcı arama hatası:", error);
            Alert.alert("Hata", "Kullanıcı arama sırasında bir hata oluştu.");
        }
    };

    // Tahlil Ekleme İşlemi
    const addTestResult = async () => {
        if (!testType || !testValue) {
            Alert.alert("Hata", "Lütfen tüm tahlil bilgilerini doldurun.");
            return;
        }

        // Aynı tetkik için veri girilmiş mi kontrol et
        if (existingTests.includes(testType)) {
            Alert.alert("Hata", `Bu tetkik (${testType}) için zaten veri girilmiş.`);
            return;
        }

        try {
            const testResultsRef = collection(db, "testResults");
            const currentDate = new Date().toISOString().split("T")[0]; // Otomatik tarih atama

            await addDoc(testResultsRef, {
                patientTc: tcNo,
                testType: testType,
                testValue: parseFloat(testValue),
                testDate: currentDate,
            });

            Alert.alert("Başarılı", `${testType} için tahlil sonucu başarıyla eklendi.`);
            setExistingTests([...existingTests, testType]); // Eklenen tetkiki listeye ekle
            setTestType("");
            setTestValue("");
        } catch (error) {
            console.log("Tahlil ekleme hatası:", error);
            Alert.alert("Hata", "Tahlil eklenirken bir hata oluştu.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Hasta Yönetimi</Text>
            <TextInput
                style={styles.input}
                placeholder="TC Kimlik Numarası"
                value={tcNo}
                onChangeText={setTcNo}
                keyboardType="numeric"
            />
            <Button title="Hastayı Ara" onPress={searchPatient} />
            {patient && (
                <View style={styles.patientInfo}>
                    <Text style={styles.infoText}>Ad: {patient.name}</Text>
                    <Text style={styles.infoText}>Soyad: {patient.surname}</Text>
                    <Text style={styles.infoText}>Doğum Tarihi: {patient.birthDate}</Text>
                </View>
            )}
            {patient && (
                <View style={styles.testForm}>
                    <Text style={styles.subHeader}>Tahlil Ekle</Text>
                    <Picker
                        selectedValue={testType}
                        onValueChange={(itemValue) => setTestType(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Tetkik Seçin" value="" />
                        {TEST_TYPES.map((test) => (
                            <Picker.Item key={test.id} label={test.name} value={test.name} />
                        ))}
                    </Picker>
                    <TextInput
                        style={styles.input}
                        placeholder="Tahlil Değeri"
                        value={testValue}
                        onChangeText={setTestValue}
                        keyboardType="numeric"
                    />
                    <Button title="Tahlil Sonucu Ekle" onPress={addTestResult} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    picker: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
    },
    patientInfo: {
        marginTop: 20,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 10,
    },
    testForm: {
        marginTop: 20,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
});

export default PatientManagementScreen;