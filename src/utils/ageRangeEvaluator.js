// src/utils/ageRangeEvaluator.js
export const isAgeInRange = (age, ageRange) => {
    // "cord" kontrolü
    if (ageRange.toLowerCase() === "cord") {
        // Eğer yaş "cord" olarak işaretlenmişse
        // Bu projede "cord" => yenidoğan (ay=0) gibi düşünebilirsiniz.
        // isAgeInRange( ay, 'cord' ) => ay==0 ise true gibi
        return age === 0;
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

    // Diğer durumlar (eşleşmiyorsa false)
    return false;
};
