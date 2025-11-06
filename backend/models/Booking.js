const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingType: {
        type: String,
        enum: ['Equipment Rental', 'Function Shoot', 'Event Coverage', 'Studio Session'],
        required: true
    },
    eventType: {
        type: String,
        enum: ['Wedding', 'Birthday', 'Party', 'Corporate', 'Portrait', 'Fashion', 'Product', 'Other'],
        default: 'Other'
    },
    
    // Equipment Details
    equipmentList: [{
        equipmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Equipment'
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        dailyRate: {
            type: Number,
            required: true
        },
        totalDays: {
            type: Number,
            required: true
        }
    }],
    
    // Booking Dates
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        required: true
    },
    
    // Event Details
    eventDetails: {
        venue: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        contactPerson: {
            type: String,
            default: ''
        },
        contactPhone: {
            type: String,
            default: ''
        },
        specialRequirements: {
            type: String,
            default: ''
        },
        guestCount: {
            type: Number,
            default: 0
        }
    },
    
    // Staff Assignment
    assignedStaff: [{
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['Photographer', 'Videographer', 'Assistant', 'Equipment Handler'],
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }],
    
    // Pricing
    pricing: {
        equipmentTotal: {
            type: Number,
            default: 0
        },
        packageAmount: {
            type: Number,
            default: 0
        },
        serviceCharges: {
            type: Number,
            default: 0
        },
        taxes: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true
        },
        advanceAmount: {
            type: Number,
            default: 0
        },
        remainingAmount: {
            type: Number,
            default: 0
        }
    },
    
    // Status Management
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Advance Paid', 'Fully Paid', 'Refunded', 'Partial Refund'],
        default: 'Pending'
    },
    
    // Payment Request System
    paymentRequests: [{
        amount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Bank Transfer'],
            required: true
        },
        requestDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },
        adminNotes: {
            type: String,
            default: ''
        },
        processedDate: {
            type: Date
        }
    }],
    
    // Subscription details (if applicable)
    subscriptionPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        default: null
    },
    packageDetails: {
        name: String,
        planType: String,
        price: Number,
        manpower: {
            photographers: Number,
            videographers: Number,
            candidPhotographers: Number,
            cinematographers: Number,
            droneOperators: Number
        }
    },
    isSubscriptionBooking: {
        type: Boolean,
        default: false
    },
    
    // Notes and Communication
    adminNotes: {
        type: String,
        default: ''
    },
    customerNotes: {
        type: String,
        default: ''
    },
    
    // Equipment Return
    equipmentReturnDate: {
        type: Date
    },
    equipmentReturnStatus: {
        type: String,
        enum: ['Pending', 'Returned', 'Partially Returned', 'Damaged', 'Lost'],
        default: 'Pending'
    },
    damageReport: {
        type: String,
        default: ''
    },
    
    // Timestamps and tracking
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'Bookings'
});

// Index for better performance
bookingSchema.index({ customerId: 1, startDate: 1 });
bookingSchema.index({ status: 1, bookingDate: -1 });
bookingSchema.index({ bookingId: 1 });

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', async function(next) {
    if (!this.bookingId) {
        const count = await this.constructor.countDocuments();
        this.bookingId = `BK${Date.now()}${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);