function isValidPhoneNumber(number) {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}

module.exports = { isValidPhoneNumber };