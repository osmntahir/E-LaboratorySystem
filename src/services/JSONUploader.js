import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Firestore bağlantısını içe aktar
import guidesData from '../../assets/klavuz-verileri.json'; // JSON dosyasını içe aktar

class JSONUploader {

    async uploadGuidesToFirestore() {
        try {
            const guidesCollection = collection(db, 'guides');

            for (const guide of guidesData.guides) {
                const processedTestTypes = guide.testTypes.map((testType) => ({
                    ...testType,
                    ageGroups: testType.ageGroups.map((ageGroup) => {
                        const { geometricMean, standardDeviation, minValue, maxValue } = ageGroup;
                        return {
                            ...ageGroup,
                            referenceMin: geometricMean && standardDeviation
                                ? (geometricMean - standardDeviation).toFixed(2)
                                : minValue,
                            referenceMax: geometricMean && standardDeviation
                                ? (geometricMean + standardDeviation).toFixed(2)
                                : maxValue,
                        };
                    }),
                }));

                await addDoc(guidesCollection, {
                    name: guide.name,
                    description: guide.description,
                    unit: guide.unit,
                    type: guide.type,
                    testTypes: processedTestTypes,
                });
            }

            console.log('Klavuzlar başarıyla yüklendi.');
        } catch (error) {
            console.error('Firestore yüklenirken hata oluştu:', error);
        }
    }
}

export default new JSONUploader();
