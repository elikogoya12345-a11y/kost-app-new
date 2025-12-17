function formatPriceText(price) {
    const num = parseInt(price);
    if (num >= 1000000) {
        const millions = num / 1000000;
        if (millions % 1 === 0) {
            return `${millions} Juta`;
        } else {
            return `${millions.toFixed(1)} Juta`;
        }
    } else if (num >= 1000) {
        const thousands = num / 1000;
        return `${thousands} Ribu`;
    }
    return num.toString();
}