const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // Duration in days
        required: true
    },
    features: [{
        type: String
    }],
    includedEquipment: [{
        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Equipment'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    includedServices: [{
        serviceName: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
    }],
    maxBookingsPerMonth: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    planType: {
        type: String,
        enum: ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium'],
        required: true
    },
    priority: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'SubscriptionPlans'
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);