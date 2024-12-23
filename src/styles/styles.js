// src/styles/styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    topButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Sağ ve sol hizalama
        alignItems: 'center',
        marginBottom: 16,
    },
    addGuideButton: {
        flex: 1,
        marginRight: 8, // JSON butonu ile arada boşluk
    },
    uploadButton: {
        backgroundColor: '#f0f0f0', // İkon buton arka plan rengi
        borderRadius: 50, // Yuvarlak buton
    },
    loadingText: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 16,
        color: '#999',
    },
    noDataText: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 16,
        color: '#444',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    ageGroupList: {
        flexGrow: 1,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
    },
});

export default styles;
