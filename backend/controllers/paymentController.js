const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const CustomerSubscription = require('../models/CustomerSubscription');
const { generateOrderId } = require('../utils/helpers');

// ============ ADMIN PAYMENT MANAGEMENT ============

// Get all payments with filtering and pagination
exports.getAllPayments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status = '', 
            paymentType = '', 
            paymentMethod = '',
            dateFrom = '',
            dateTo = '',
            search = ''
        } = req.query;
        
        const filter = {};
        
        if (status) filter.status = status;
        if (paymentType) filter.paymentType = paymentType;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        
        if (dateFrom || dateTo) {
            filter.paymentDate = {};
            if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
            if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
        }
        
        // Build aggregation pipeline for search and population
        const aggregationPipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            {
                $unwind: '$customer'
            },
            {
                $unwind: '$booking'
            }
        ];
        
        // Add search filter if provided
        if (search) {
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { paymentId: { $regex: search, $options: 'i' } },
                        { 'customer.name': { $regex: search, $options: 'i' } },
                        { 'customer.email': { $regex: search, $options: 'i' } },
                        { 'booking.bookingId': { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }
        
        // Add other filters
        if (Object.keys(filter).length > 0) {
            aggregationPipeline.push({ $match: filter });
        }
        
        // Add sorting
        aggregationPipeline.push({ $sort: { paymentDate: -1 } });
        
        // Execute aggregation with pagination
        const payments = await Payment.aggregate([
            ...aggregationPipeline,
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ]);
        
        // Get total count
        const totalCount = await Payment.aggregate([
            ...aggregationPipeline,
            { $count: 'total' }
        ]);
        
        const total = totalCount[0]?.total || 0;
        
        // Get payment statistics
        const paymentStats = await Payment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        
        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                },
                statistics: paymentStats
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error.message
        });
    }
};

// Get single payment details
exports.getPaymentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const payment = await Payment.findById(id)
            .populate('customerId', 'name email phone address')
            .populate('bookingId', 'bookingId eventType eventDate equipmentList totalAmount');
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment details',
            error: error.message
        });
    }
};

// Create manual payment (admin only)
exports.createManualPayment = async (req, res) => {
    try {
        const {
            bookingId,
            customerId,
            amount,
            paymentType,
            paymentMethod,
            transactionId,
            description,
            status = 'Completed'
        } = req.body;
        
        // Verify booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Create payment
        const payment = new Payment({
            bookingId,
            customerId,
            amount,
            paymentType,
            paymentMethod,
            transactionId,
            description,
            status,
            paymentDate: new Date()
        });
        
        await payment.save();
        
        // Update booking payment status if needed
        if (status === 'Completed') {
            const totalPaid = await Payment.aggregate([
                {
                    $match: {
                        bookingId: booking._id,
                        status: 'Completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);
            
            const paidAmount = totalPaid[0]?.total || 0;
            
            if (paidAmount >= booking.totalAmount) {
                booking.paymentStatus = 'Paid';
            } else if (paidAmount > 0) {
                booking.paymentStatus = 'Partial';
            }
            
            await booking.save();
        }
        
        const populatedPayment = await Payment.findById(payment._id)
            .populate('customerId', 'name email')
            .populate('bookingId', 'bookingId eventType');
        
        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: populatedPayment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment',
            error: error.message
        });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, transactionId, description } = req.body;
        
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        payment.status = status;
        if (transactionId) payment.transactionId = transactionId;
        if (description) payment.description = description;
        
        await payment.save();
        
        // Update booking payment status
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
            const totalPaid = await Payment.aggregate([
                {
                    $match: {
                        bookingId: booking._id,
                        status: 'Completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);
            
            const paidAmount = totalPaid[0]?.total || 0;
            
            if (paidAmount >= booking.totalAmount) {
                booking.paymentStatus = 'Paid';
            } else if (paidAmount > 0) {
                booking.paymentStatus = 'Partial';
            } else {
                booking.paymentStatus = 'Pending';
            }
            
            await booking.save();
        }
        
        const updatedPayment = await Payment.findById(id)
            .populate('customerId', 'name email')
            .populate('bookingId', 'bookingId eventType');
        
        res.json({
            success: true,
            message: 'Payment status updated successfully',
            data: updatedPayment
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment status',
            error: error.message
        });
    }
};

// Process refund
exports.processRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const { refundAmount, refundReason, refundMethod } = req.body;
        
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        if (payment.status !== 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only refund completed payments'
            });
        }
        
        // Update payment with refund details
        payment.status = 'Refunded';
        payment.refundDetails = {
            refundAmount,
            refundReason,
            refundDate: new Date(),
            refundMethod
        };
        
        await payment.save();
        
        // Create refund entry as a separate payment record
        const refundPayment = new Payment({
            bookingId: payment.bookingId,
            customerId: payment.customerId,
            amount: -Math.abs(refundAmount), // Negative amount for refund
            paymentType: 'Refund',
            paymentMethod: refundMethod,
            description: `Refund for payment ${payment.paymentId}. Reason: ${refundReason}`,
            status: 'Completed',
            paymentDate: new Date()
        });
        
        await refundPayment.save();
        
        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                originalPayment: payment,
                refundPayment
            }
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

// ============ INVOICE MANAGEMENT ============

// Generate invoice for payment
exports.generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        
        const payment = await Payment.findById(id)
            .populate('customerId', 'name email phone address')
            .populate('bookingId', 'bookingId eventType eventDate equipmentList totalAmount venue');
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        // Mock invoice generation - In production, use a library like PDFKit or puppeteer
        const invoiceData = {
            invoiceNumber: `INV-${payment.paymentId}`,
            date: new Date().toLocaleDateString(),
            dueDate: payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A',
            customer: {
                name: payment.customerId.name,
                email: payment.customerId.email,
                phone: payment.customerId.phone,
                address: payment.customerId.address
            },
            booking: {
                id: payment.bookingId.bookingId,
                eventType: payment.bookingId.eventType,
                eventDate: new Date(payment.bookingId.eventDate).toLocaleDateString(),
                venue: payment.bookingId.venue
            },
            payment: {
                id: payment.paymentId,
                amount: payment.amount,
                type: payment.paymentType,
                method: payment.paymentMethod,
                status: payment.status,
                date: new Date(payment.paymentDate).toLocaleDateString()
            },
            items: payment.bookingId.equipmentList?.map(item => ({
                name: item.equipmentName || 'Equipment',
                quantity: item.quantity || 1,
                rate: item.dailyRate || 0,
                days: item.totalDays || 1,
                amount: (item.quantity || 1) * (item.dailyRate || 0) * (item.totalDays || 1)
            })) || [],
            totals: {
                subtotal: payment.amount,
                tax: 0, // Can be calculated based on business rules
                total: payment.amount
            }
        };
        
        // Mark invoice as generated
        payment.invoiceGenerated = true;
        payment.receiptNumber = invoiceData.invoiceNumber;
        await payment.save();
        
        res.json({
            success: true,
            message: 'Invoice generated successfully',
            data: invoiceData
        });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice',
            error: error.message
        });
    }
};

// Get payment statistics for dashboard
exports.getPaymentStatistics = async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        
        // Total revenue
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'Completed', amount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Monthly revenue
        const monthlyRevenue = await Payment.aggregate([
            { 
                $match: { 
                    status: 'Completed', 
                    amount: { $gt: 0 },
                    paymentDate: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Payment method distribution
        const paymentMethodStats = await Payment.aggregate([
            { $match: { status: 'Completed', amount: { $gt: 0 } } },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);
        
        // Payment status distribution
        const paymentStatusStats = await Payment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        
        // Monthly trend (last 12 months)
        const monthlyTrend = await Payment.aggregate([
            {
                $match: {
                    status: 'Completed',
                    amount: { $gt: 0 },
                    paymentDate: { $gte: new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$paymentDate' },
                        month: { $month: '$paymentDate' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        // Pending payments
        const pendingPayments = await Payment.countDocuments({ status: 'Pending' });
        const overduePayments = await Payment.countDocuments({
            status: 'Pending',
            dueDate: { $lt: currentDate }
        });
        
        res.json({
            success: true,
            data: {
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    monthly: monthlyRevenue[0]?.total || 0
                },
                paymentMethods: paymentMethodStats,
                paymentStatus: paymentStatusStats,
                monthlyTrend,
                pending: {
                    total: pendingPayments,
                    overdue: overduePayments
                }
            }
        });
    } catch (error) {
        console.error('Error fetching payment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment statistics',
            error: error.message
        });
    }
};

// ============ USER PAYMENT METHODS ============

// Get user's payment history
exports.getUserPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        
        const payments = await Payment.find({ customerId: userId })
            .populate('bookingId', 'bookingId eventType eventDate')
            .sort({ paymentDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Payment.countDocuments({ customerId: userId });
        
        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history',
            error: error.message
        });
    }
};

// Create payment for booking (user)
exports.createBookingPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            bookingId,
            amount,
            paymentType,
            paymentMethod,
            transactionId
        } = req.body;
        
        // Verify booking belongs to user
        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: userId
        });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or unauthorized'
            });
        }
        
        // Create payment
        const payment = new Payment({
            bookingId,
            customerId: userId,
            amount,
            paymentType,
            paymentMethod,
            transactionId,
            status: 'Completed', // For demo purposes - integrate with actual payment gateway
            paymentDate: new Date()
        });
        
        await payment.save();
        
        // Update booking payment status
        const totalPaid = await Payment.aggregate([
            {
                $match: {
                    bookingId: booking._id,
                    status: 'Completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        
        const paidAmount = totalPaid[0]?.total || 0;
        
        if (paidAmount >= booking.totalAmount) {
            booking.paymentStatus = 'Paid';
        } else if (paidAmount > 0) {
            booking.paymentStatus = 'Partial';
        }
        
        await booking.save();
        
        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error creating booking payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
};