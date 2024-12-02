// src/utils/ageCalculator.js
export const calculateAgeInMonths = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    const totalMonths = years * 12 + months;
    return totalMonths;
};
