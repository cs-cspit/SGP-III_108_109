const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Camera', 'Lens', 'Tripod', 'Light', 'Microphone', 'Drone', 'Gimbal', 'Battery', 'Memory Card', 'Other']
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    dailyRentPrice: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    image_url: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    specifications: {
        type: Map,
        of: String,
        default: {}
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    availableQuantity: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['Available', 'Rented', 'Maintenance', 'Discontinued'],
        default: 'Available'
    },
    maintenanceNotes: {
        type: String,
        default: ''
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    lastMaintenanceDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'Equipment'
});

// Add index for better search performance
equipmentSchema.index({ name: 'text', brand: 'text', model: 'text', type: 'text' });

module.exports = mongoose.model('Equipment', equipmentSchema);