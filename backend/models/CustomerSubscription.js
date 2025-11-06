const mongoose = require('mongoose');

const customerSubscriptionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },
    subscriptionId: {
        type: String,
        unique: true,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Expired', 'Cancelled', 'Suspended', 'Rejected'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    adminApproval: {
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvalDate: Date,
        rejectionReason: String,
        adminNotes: String
    },
    amountPaid: {
        type: Number,
        required: true
    },
    discountApplied: {
        type: Number,
        default: 0
    },
    bookingsUsed: {
        type: Number,
        default: 0
    },
    maxBookingsAllowed: {
        type: Number,
        default: 0
    },
    autoRenewal: {
        type: Boolean,
        default: false
    },
    renewalDate: {
        type: Date
    },
    cancellationDate: {
        type: Date
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    collection: 'CustomerSubscriptions'
});

// Index for better performance
customerSubscriptionSchema.index({ customerId: 1, status: 1 });
customerSubscriptionSchema.index({ subscriptionPlanId: 1 });
customerSubscriptionSchema.index({ endDate: 1 });

// Pre-save middleware to generate subscription ID
customerSubscriptionSchema.pre('save', async function(next) {
    if (!this.subscriptionId) {
        const count = await this.constructor.countDocuments();
        this.subscriptionId = `SUB${Date.now()}${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('CustomerSubscription', customerSubscriptionSchema);