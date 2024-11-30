// src/services/firebaseService.js
import { db } from '../../firebaseConfig';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
} from 'firebase/firestore';

// Kılavuz işlemleri
export const addGuide = async (guide) => {
    return await addDoc(collection(db, 'guides'), guide);
};

export const updateGuide = async (id, guide) => {
    const guideRef = doc(db, 'guides', id);
    return await updateDoc(guideRef, guide);
};

export const deleteGuide = async (id) => {
    const guideRef = doc(db, 'guides', id);
    return await deleteDoc(guideRef);
};

export const getGuides = async () => {
    const querySnapshot = await getDocs(collection(db, 'guides'));
    let guides = [];
    querySnapshot.forEach((doc) => {
        guides.push({ id: doc.id, ...doc.data() });
    });
    return guides;
};

// Tetkik işlemleri
export const addTest = async (guideId, test) => {
    return await addDoc(collection(db, 'guides', guideId, 'tests'), test);
};

export const updateTest = async (guideId, testId, test) => {
    const testRef = doc(db, 'guides', guideId, 'tests', testId);
    return await updateDoc(testRef, test);
};

export const deleteTest = async (guideId, testId) => {
    const testRef = doc(db, 'guides', guideId, 'tests', testId);
    return await deleteDoc(testRef);
};

export const getTests = async (guideId) => {
    const testsCollection = collection(db, 'guides', guideId, 'tests');
    const querySnapshot = await getDocs(testsCollection);
    let tests = [];
    querySnapshot.forEach((doc) => {
        tests.push({ id: doc.id, ...doc.data() });
    });
    return tests;
};

// Yaş grubu işlemleri
export const addAgeGroup = async (guideId, testId, ageGroup) => {
    return await addDoc(
        collection(db, 'guides', guideId, 'tests', testId, 'ageGroups'),
        ageGroup
    );
};

export const updateAgeGroup = async (guideId, testId, ageGroupId, ageGroup) => {
    const ageGroupRef = doc(
        db,
        'guides',
        guideId,
        'tests',
        testId,
        'ageGroups',
        ageGroupId
    );
    return await updateDoc(ageGroupRef, ageGroup);
};

export const deleteAgeGroup = async (guideId, testId, ageGroupId) => {
    const ageGroupRef = doc(
        db,
        'guides',
        guideId,
        'tests',
        testId,
        'ageGroups',
        ageGroupId
    );
    return await deleteDoc(ageGroupRef);
};

export const getAgeGroups = async (guideId, testId) => {
    const ageGroupsCollection = collection(
        db,
        'guides',
        guideId,
        'tests',
        testId,
        'ageGroups'
    );
    const querySnapshot = await getDocs(ageGroupsCollection);
    let ageGroups = [];
    querySnapshot.forEach((doc) => {
        ageGroups.push({ id: doc.id, ...doc.data() });
    });
    return ageGroups;
};
