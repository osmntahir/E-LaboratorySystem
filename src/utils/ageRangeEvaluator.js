// src/utils/ageRangeEvaluator.js
export const isAgeInRange = (age, ageRange) => {
    // "cord" kontrolü
    if (ageRange.toLowerCase() === "cord") {
        // Eğer yaş "cord" olarak işaretlenmişse, bu gruba dahil
        return age === "cord";
    }

    // "min-max" formatı kontrolü
    if (ageRange.includes("-")) {
        const [minAge, maxAge] = ageRange.split("-").map(Number);
        return age >= minAge && age <= maxAge;
    }

    // "min+" formatı kontrolü (ör. "217+")
    if (ageRange.includes("+")) {
        const minAge = parseInt(ageRange.replace("+", ""), 10);
        return age >= minAge;
    }

    // Belirtilen formatların dışında kalan durumlar
    return false;
};
