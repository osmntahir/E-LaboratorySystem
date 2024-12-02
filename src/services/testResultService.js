// src/services/testResultService.js
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const addTestResult = async (testResult) => {
    try {
        await addDoc(collection(db, 'testResults'), testResult);
    } catch (error) {
        console.error('Error adding test result: ', error);
        throw error;
    }
};
