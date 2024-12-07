// src/utils/ageRangeHelper.js


export const parseAgeRange = (rangeString) => {
    // "cord" kontrolü
    if (rangeString.toLowerCase() === 'cord') {
        return { type: 'cord', min: null, max: null };
    }

    // "min-max" formatı
    if (rangeString.includes("-")) {
        const [minStr, maxStr] = rangeString.split("-").map(s => s.trim());
        const minVal = parseInt(minStr, 10);
        const maxVal = parseInt(maxStr, 10);
        if (!isNaN(minVal) && !isNaN(maxVal)) {
            return { type: 'range', min: minVal, max: maxVal };
        }
    }

    // "min+" formatı (ör: "217+")
    if (rangeString.includes("+")) {
        const baseVal = parseInt(rangeString.replace("+","").trim(), 10);
        if (!isNaN(baseVal)) {
            // min = baseVal, max = sonsuz
            return { type: 'range', min: baseVal, max: Infinity };
        }
    }

    // Eğer farklı bir format yok ise null dönebiliriz
    return null;
};


export const checkRangeOverlap = (userRange, guideRange) => {
    // Eğer ikisi de cord ise doğrudan true
    if (userRange.type === 'cord' && guideRange.type === 'cord') {
        return true;
    }

    // Biri cord diğeri normal aralık ise kesişim yok
    if (userRange.type === 'cord' && guideRange.type !== 'cord') return false;
    if (guideRange.type === 'cord' && userRange.type !== 'cord') return false;

    // Her ikisi de aralık ise kesişimi kontrol edelim
    if (userRange.type === 'range' && guideRange.type === 'range') {
        // Aralıklar [userMin, userMax] ve [guideMin, guideMax]
        // Kesişim varsa: guideMax >= userMin ve userMax >= guideMin
        return (guideRange.max >= userRange.min && userRange.max >= guideRange.min);
    }

    // Diğer durumlar (örneğin biri null döndüyse) false dönebiliriz
    return false;
};


export const sortAgeRanges = (ageGroups) => {
    return ageGroups
        .map(group => ({
            ...group,
            parsedRange: parseAgeRange(group.ageRange)
        }))
        .filter(group => group.parsedRange !== null) // Geçersiz formatları çıkar
        .sort((a, b) => {
            if (a.parsedRange.type === 'cord' && b.parsedRange.type !== 'cord') return 1;
            if (b.parsedRange.type === 'cord' && a.parsedRange.type !== 'cord') return -1;
            if (a.parsedRange.type === 'range' && b.parsedRange.type === 'range') {
                return a.parsedRange.min - b.parsedRange.min;
            }
            return 0;
        })
        .map(group => {
            // parsedRange'ı kaldırmak için
            const { parsedRange, ...rest } = group;
            return rest;
        });
};
