const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    settingKey: {
        type: String,
        required: true,
        unique: true
    },
    settingValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    settingType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'object', 'array'],
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'pricing', 'email', 'sms', 'booking', 'payment', 'notification'],
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    collection: 'AdminSettings'
});

// Index for better performance
adminSettingsSchema.index({ settingKey: 1 });
adminSettingsSchema.index({ category: 1 });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);