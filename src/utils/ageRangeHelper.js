// src/utils/ageRangeHelper.js

/**
 * Kullanıcının veya kılavuzun yaş aralığı stringini parse ederek
 * { type: 'cord' } veya { type: 'range', min: number, max: number } döndürür.
 * Örnek:
 *  - "cord" => { type: 'cord', min: null, max: null }
 *  - "0-20" => { type: 'range', min:0, max:20 }
 *  - "217+" => { type: 'range', min:217, max: Infinity }
 */
export const parseAgeRange = (rangeString) => {
    if (!rangeString || typeof rangeString !== 'string') {
        return null;
    }

    const rangeLower = rangeString.toLowerCase().trim();

    // "cord" kontrolü
    if (rangeLower === 'cord') {
        return { type: 'cord', min: 0, max: 0 };
    }

    // "min-max" formatı
    if (rangeString.includes('-')) {
        const [minStr, maxStr] = rangeString.split('-').map(s => s.trim());
        const minVal = parseInt(minStr, 10);
        const maxVal = parseInt(maxStr, 10);
        if (!isNaN(minVal) && !isNaN(maxVal)) {
            return { type: 'range', min: minVal, max: maxVal };
        }
    }

    // "min+" formatı (ör: "217+")
    if (rangeString.includes('+')) {
        const baseVal = parseInt(rangeString.replace('+', '').trim(), 10);
        if (!isNaN(baseVal)) {
            return { type: 'range', min: baseVal, max: Infinity };
        }
    }

    // Eğer farklı format yok ise null
    return null;
};


/**
 * Kullanıcının girdiği aralık (userRange) içinde,
 * kılavuzdaki aralığın (guideRange) TAMAMEN içerilip içerilmediğini kontrol eder.
 *
 * Örnek:
 *  - userRange: 0-20
 *    guideRange: 5-12 => tam olarak 0-20 içinde olduğu için true döner.
 *    guideRange: 10-25 => 25, userMax(20)'u aştığı için false döner.
 *  - cord => sadece guideRange cord ise true
 */
export const checkRangeInclusion = (userRange, guideRange) => {
    // İkisi de yoksa false
    if (!userRange || !guideRange) return false;

    // İkisi de cord ise
    if (userRange.type === 'cord' && guideRange.type === 'cord') {
        return true;
    }

    // Biri cord diğeri range ise, tam içerme yok
    if (userRange.type === 'cord' && guideRange.type !== 'cord') return false;
    if (guideRange.type === 'cord' && userRange.type !== 'cord') return false;

    // Her ikisi de aralık (range) ise
    if (userRange.type === 'range' && guideRange.type === 'range') {
        // TAM olarak userRange içinde olması için:
        // guideRange.min >= userRange.min && guideRange.max <= userRange.max
        return (
            guideRange.min >= userRange.min && guideRange.max <= userRange.max
        );
    }

    return false;
};


/**
 * Kılavuzdaki ageGroups dizisini parse ve sort eder.
 * Örneğin "cord" => en sona, "0-1" => önce, "2-5" => sonra gibi bir sıralama.
 * Bu fonksiyon sadece ageGroups dizisini sıralar;
 * "tam içerme" veya "kesişim" gibi filtreleme yapmaz.
 */
export const sortAgeRanges = (ageGroups) => {
    return ageGroups
        .map(group => ({
            ...group,
            parsedRange: parseAgeRange(group.ageRange),
        }))
        .filter(group => group.parsedRange !== null) // Geçersiz formatları çıkar
        .sort((a, b) => {
            // cord -> en üstte mi olsun, en altta mı olsun ihtiyaca göre ayarlanabilir.
            // Burada cord'u en sona koyuyoruz (return 1 => a > b).
            if (a.parsedRange.type === 'cord' && b.parsedRange.type !== 'cord') return 1;
            if (b.parsedRange.type === 'cord' && a.parsedRange.type !== 'cord') return -1;

            if (a.parsedRange.type === 'range' && b.parsedRange.type === 'range') {
                return a.parsedRange.min - b.parsedRange.min;
            }
            return 0;
        })
        .map(group => {
            // parsedRange'ı dönüşte kaldır (UI'da ihtiyacımız yok)
            const { parsedRange, ...rest } = group;
            return rest;
        });
};
