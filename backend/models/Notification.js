const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['booking', 'payment', 'equipment', 'system', 'reminder', 'alert'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    recipientType: {
        type: String,
        enum: ['admin', 'customer', 'staff', 'all'],
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedEntityType: {
        type: String,
        enum: ['booking', 'payment', 'equipment', 'customer', 'subscription']
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    actionRequired: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String,
        default: ''
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'Notifications'
});

// Index for better performance
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });

module.exports = mongoose.model('Notification', notificationSchema);