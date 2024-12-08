// src/services/testResultService.js
import { collection, addDoc , deleteDoc , updateDoc , doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const addTestResult = async (testResult) => {
    try {
        await addDoc(collection(db, 'testResults'), testResult);
    } catch (error) {
        console.error('Error adding test result: ', error);
        throw error;
    }
};


export const updateTestResult = async (resultId, updatedData) => {
    const resultRef = doc(db, 'testResults', resultId);
    await updateDoc(resultRef, updatedData);
};


export const deleteTestResult = async (resultId) => {
    const resultRef = doc(db, 'testResults', resultId);
    await deleteDoc(resultRef);
};
