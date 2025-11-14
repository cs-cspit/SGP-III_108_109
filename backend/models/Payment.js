const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        unique: true,
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentType: {
        type: String,
        enum: ['Advance', 'Full Payment', 'Remaining Payment', 'Refund', 'Damage Charge'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Bank Transfer'],
        required: true
    },
    transactionId: {
        type: String,
        default: ''
    },
    paymentGateway: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    description: {
        type: String,
        default: ''
    },
    receiptNumber: {
        type: String,
        default: ''
    },
    invoiceGenerated: {
        type: Boolean,
        default: false
    },
    invoicePath: {
        type: String,
        default: ''
    },
    refundDetails: {
        refundAmount: {
            type: Number,
            default: 0
        },
        refundReason: {
            type: String,
            default: ''
        },
        refundDate: {
            type: Date
        },
        refundMethod: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true,
    collection: 'Payments'
});

// Index for better performance
paymentSchema.index({ bookingId: 1, paymentDate: -1 });
paymentSchema.index({ customerId: 1, paymentDate: -1 });
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ status: 1 });

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', async function(next) {
    if (!this.paymentId) {
        const count = await this.constructor.countDocuments();
        this.paymentId = `PAY${Date.now()}${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);