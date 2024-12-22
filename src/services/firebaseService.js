// src/services/firebaseService.js
import { db } from '../../firebaseConfig';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    addDoc,
    deleteDoc,
} from 'firebase/firestore';

/**
 * Tüm kılavuzları getir
 */
export const getAllGuides = async () => {
    const guidesSnapshot = await getDocs(collection(db, 'guides'));
    return guidesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};

/**
 * Tekil kılavuz verisini getir
 */
export const getGuideById = async (guideId) => {
    const guideRef = doc(db, 'guides', guideId);
    const guideSnap = await getDoc(guideRef);
    if (guideSnap.exists()) {
        return { id: guideSnap.id, ...guideSnap.data() };
    }
    return null;
};

/**
 * Kılavuz ekle
 */
export const addGuide = async (guideData) => {
    const guidesRef = collection(db, 'guides');
    const newDocRef = await addDoc(guidesRef, {
        ...guideData,
        // testTypes boş array olarak başlatılabilir
        testTypes: [],
    });
    return newDocRef.id;
};

/**
 * Kılavuz güncelle
 */
export const updateGuide = async (guideId, guideData) => {
    const guideRef = doc(db, 'guides', guideId);
    await updateDoc(guideRef, {
        ...guideData,
    });
};

/**
 * Kılavuz sil
 */
export const deleteGuide = async (guideId) => {
    const guideRef = doc(db, 'guides', guideId);
    await deleteDoc(guideRef);
};

/**
 * Test ekle
 * guideId: ekleneceği kılavuzun ID'si
 * testData: { name: "IgA", ageGroups: [] } gibi bir obje
 */
export const addTest = async (guideId, testData) => {
    const guideRef = doc(db, 'guides', guideId);
    const guideSnap = await getDoc(guideRef);
    if (!guideSnap.exists()) return;

    const guide = guideSnap.data();
    // testTypes dizisine yeni test'i ekle
    const updatedTestTypes = [...(guide.testTypes || []), { ...testData, ageGroups: [] }];
    await updateDoc(guideRef, { testTypes: updatedTestTypes });
};

/**
 * Test güncelle
 * testData: { name: "IgM" } gibi.
 * Not: ageGroups dizisine dokunmadan sadece test adını düzenlemek için.
 */
export const updateTest = async (guideId, testName, testData) => {
    const guideRef = doc(db, 'guides', guideId);
    const guideSnap = await getDoc(guideRef);
    if (!guideSnap.exists()) return;

    const guide = guideSnap.data();
    const updatedTestTypes = (guide.testTypes || []).map((test) => {
        if (test.name === testName) {
            return { ...test, ...testData };
        }
        return test;
    });

    await updateDoc(guideRef, { testTypes: updatedTestTypes });
};

/**
 * Test sil
 */
export const deleteTest = async (guideId, testName) => {
    const guideRef = doc(db, 'guides', guideId);
    const guideSnap = await getDoc(guideRef);
    if (!guideSnap.exists()) return;

    const guide = guideSnap.data();
    const updatedTestTypes = (guide.testTypes || []).filter(
        (test) => test.name !== testName
    );

    await updateDoc(guideRef, { testTypes: updatedTestTypes });
};

/**
 * Yaş Grubu ekle
 */
export const addAgeGroup = async (guideId, testName, ageGroupData) => {
    const guideRef = doc(db, 'guides', guideId);
    const guideSnap = await getDoc(guideRef);
    if (!guideSnap.exists()) return;

    const guide = guideSnap.data();

    // Klavuz tipine göre referans değerlerini hesapla
    let referenceMin = 0;
    let referenceMax = 0;

    if (guide.type === 'geometric') {
        const { geometricMean, standardDeviation } = ageGroupData;
        referenceMin = parseFloat(geometricMean) - parseFloat(standardDeviation);
        referenceMax = parseFloat(geometricMean) + parseFloat(standardDeviation);
    } else if (guide.type === 'minMax') {
        const { minValue, maxValue } = ageGroupData;
        referenceMin = parseFloat(minValue);
        referenceMax = parseFloat(maxValue);
    }

    const newAgeGroup = {
        ...ageGroupData,
        referenceMin,
        referenceMax,
    };

    const updatedTestTypes = (guide.testTypes || []).map((test) => {
        if (test.name === testName) {
            // AgeGroups yoksa başlat
            const updatedAgeGroups = [...(test.ageGroups || []), newAgeGroup];
            return { ...test, ageGroups: updatedAgeGroups };
        }
        return test;
    });

    await updateDoc(guideRef, { testTypes: updatedTestTypes });
};

/**
 * Yaş Grubu güncelle
 */
export const updateAgeGroup = async (guideId, testName, ageGroupIndex, ageGroupData) => {
    const guideRef = doc(db, 'guides', guideId);
    const guideSnap = await getDoc(guideRef);
    if (!guideSnap.exists()) return;

    const guide = guideSnap.data();

    // Klavuz tipine göre referans değerlerini hesapla
    let referenceMin = 0;
    let referenceMax = 0;

    if (guide.type === 'geometric') {
        const { geometricMean, standardDeviation } = ageGroupData;
        referenceMin = parseFloat(geometricMean) - parseFloat(standardDeviation);
        referenceMax = parseFloat(geometricMean) + parseFloat(standardDeviation);
    } else if (guide.type === 'minMax') {
        const { minValue, maxValue } = ageGroupData;
        referenceMin = parseFloat(minValue);
        referenceMax = parseFloat(maxValue);
    }

    const updatedTestTypes = (guide.testTypes || []).map((test) => {
        if (test.name === testName) {
            const updatedAgeGroups = [...(test.ageGroups || [])];
            // index'e göre ilgili yaş grubunu güncelle
            updatedAgeGroups[ageGroupIndex] = {
                ...updatedAgeGroups[ageGroupIndex],
                ...ageGroupData,
                referenceMin,
                referenceMax,
            };
            return { ...test, ageGroups: updatedAgeGroups };
        }
        return test;
    });

    await updateDoc(guideRef, { testTypes: updatedTestTypes });
};

/**
 * Yaş Grubu sil
 */
export const deleteAgeGroup = async (guideId, testName, ageGroupIndex) => {
    const guideRef = doc(db, 'guides', guideId);
    const guideSnap = await getDoc(guideRef);
    if (!guideSnap.exists()) return;

    const guide = guideSnap.data();
    const updatedTestTypes = (guide.testTypes || []).map((test) => {
        if (test.name === testName) {
            const updatedAgeGroups = [...(test.ageGroups || [])];
            if (updatedAgeGroups.length > ageGroupIndex) {
                updatedAgeGroups.splice(ageGroupIndex, 1);
            }
            return { ...test, ageGroups: updatedAgeGroups };
        }
        return test;
    });

    await updateDoc(guideRef, { testTypes: updatedTestTypes });
};
