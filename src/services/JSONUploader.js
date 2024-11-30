import { collection, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Firestore bağlantısını içe aktar
import guidesData from '../../assets/klavuz-verileri.json'; // JSON dosyasını içe aktar

class JSONUploader {
    /**
     * Firestore'a JSON'dan kılavuzları yükler.
     */
    async uploadGuides() {
        try {
            console.log('JSON yükleme işlemi başlıyor...');
            for (const guide of guidesData.guides) {
                // 1. Kılavuzu ekle
                const guideRef = await addDoc(collection(db, 'guides'), {
                    name: guide.name,
                    description: guide.description,
                });
                console.log(`Kılavuz eklendi: ${guide.name}`);

                for (const test of guide.testTypes) {
                    // 2. Tetkikleri ekle
                    const testRef = await addDoc(
                        collection(db, 'guides', guideRef.id, 'tests'),
                        {
                            name: test.name,
                            unit: test.unit,
                        }
                    );
                    console.log(`Tetkik eklendi: ${test.name}`);

                    for (const ageGroup of test.ageGroups) {
                        // 3. Yaş Gruplarını ekle
                        await addDoc(
                            collection(
                                db,
                                'guides',
                                guideRef.id,
                                'tests',
                                testRef.id,
                                'ageGroups'
                            ),
                            {
                                ageRange: ageGroup.ageRange,
                                minValue: ageGroup.minValue,
                                maxValue: ageGroup.maxValue,
                            }
                        );
                        console.log(
                            `Yaş Grubu eklendi: ${ageGroup.ageRange} (${test.name})`
                        );
                    }
                }
            }
            console.log('JSON verileri başarıyla yüklendi!');
        } catch (error) {
            console.error('JSON yükleme sırasında hata oluştu:', error);
        }
    }
}

export default new JSONUploader();
