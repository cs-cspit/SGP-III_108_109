// Generate unique order ID
exports.generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD${timestamp}${random.toUpperCase()}`;
};

// Generate unique subscription ID
exports.generateSubscriptionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `SUB${timestamp}${random.toUpperCase()}`;
};

// Calculate subscription end date
exports.calculateEndDate = (startDate, durationInDays) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationInDays);
    return endDate;
};

// Format currency
exports.formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

// Calculate discount amount
exports.calculateDiscount = (originalAmount, discountPercentage) => {
    return (originalAmount * discountPercentage) / 100;
};

// Validate email format
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate random string
exports.generateRandomString = (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
};

// Check if date is expired
exports.isDateExpired = (date) => {
    return new Date(date) < new Date();
};