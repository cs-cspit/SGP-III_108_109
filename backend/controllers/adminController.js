const Equipment = require('../models/Equipment');
const mongoose = require('mongoose');
const Camera = require('../models/dataModel'); // Your existing camera model
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const CustomerSubscription = require('../models/CustomerSubscription');
const Notification = require('../models/Notification');
const AdminSettings = require('../models/AdminSettings');

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        
        // Get total counts
        const totalBookings = 0; // You can implement booking count later
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalEquipment = await Camera.countDocuments(); // Using your camera collection
        
        // Get revenue data
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const monthlyRevenue = await Payment.aggregate([
            { 
                $match: { 
                    status: 'Completed',
                    paymentDate: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Get booking stats
        const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
        const todayBookings = await Booking.countDocuments({
            startDate: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) }
        });
        
        // Get inventory stats - simplified for camera collection
        const availableEquipment = await Camera.countDocuments();
        const rentedEquipment = 0; // Can be implemented later
        const maintenanceEquipment = 0; // Can be implemented later
        
        // Get pending requests count
        const pendingPaymentRequests = await Booking.countDocuments({
            'paymentRequests.status': 'Pending'
        });
        
        const pendingSubscriptionRequests = await CustomerSubscription.countDocuments({
            status: 'Pending'
        });
        
        const totalPendingRequests = pendingPaymentRequests + pendingSubscriptionRequests;
        
        // Low stock warnings - for now, show cameras with low ratings as example
        const lowStockItems = await Camera.find({ 
            rating: { $lt: 3 }
        }).select('name rating').limit(5);
        
        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('bookingId customerId totalAmount status createdAt eventType');
        
        // Top subscription plans
        const topPlans = await CustomerSubscription.aggregate([
            { $match: { status: 'Active' } },
            { 
                $lookup: {
                    from: 'subscriptionplans',
                    localField: 'subscriptionPlanId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            { $unwind: '$plan' },
            { 
                $group: {
                    _id: '$subscriptionPlanId',
                    count: { $sum: 1 },
                    planName: { $first: '$plan.displayName' },
                    revenue: { $sum: '$amountPaid' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        const stats = {
            overview: {
                totalBookings,
                totalCustomers,
                totalEquipment,
                totalRevenue: totalRevenue[0]?.total || 0,
                monthlyRevenue: monthlyRevenue[0]?.total || 0
            },
            bookings: {
                pending: pendingBookings,
                today: todayBookings,
                thisMonth: await Booking.countDocuments({
                    createdAt: { $gte: startOfMonth }
                })
            },
            inventory: {
                available: availableEquipment,
                rented: rentedEquipment,
                maintenance: maintenanceEquipment,
                total: totalEquipment
            },
            alerts: {
                lowStock: lowStockItems,
                pendingApprovals: pendingBookings,
                pendingRequests: totalPendingRequests,
                overdueReturns: await Booking.countDocuments({
                    equipmentReturnStatus: 'Pending',
                    equipmentReturnDate: { $lt: new Date() }
                })
            },
            recentActivity: {
                recentBookings,
                topPlans
            }
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};

// Equipment Management - Using existing Camera collection
exports.getAllEquipment = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', type = '', status = '' } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get cameras from your existing collection
        const cameras = await Camera.find(query)
            .sort({ _id: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Camera.countDocuments(query);
        
        res.json({
            equipment: cameras,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment', error: error.message });
    }
};

exports.addEquipment = async (req, res) => {
    try {
        // Add to existing camera collection with your schema
        const { name, price, rating, image_url } = req.body;
        const camera = new Camera({ 
            name, 
            price: Number(price), 
            rating: Number(rating) || 4.0, 
            image_url 
        });
        await camera.save();
        res.status(201).json({ message: 'Equipment added successfully', equipment: camera });
    } catch (error) {
        res.status(400).json({ message: 'Error adding equipment', error: error.message });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, rating, image_url } = req.body;
        
        const camera = await Camera.findByIdAndUpdate(id, {
            name,
            price: Number(price),
            rating: Number(rating),
            image_url
        }, { new: true });
        
        if (!camera) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        
        res.json({ message: 'Equipment updated successfully', equipment: camera });
    } catch (error) {
        res.status(400).json({ message: 'Error updating equipment', error: error.message });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const camera = await Camera.findByIdAndDelete(id);
        
        if (!camera) {
            return res.status(404).json({ message: 'Equipment not found' });
        }
        
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting equipment', error: error.message });
    }
};

// Get equipment types for filters
exports.getEquipmentTypes = async (req, res) => {
    try {
        // Since your existing schema doesn't have types, return camera types
        const types = ['Camera', 'Lens', 'Tripod', 'Light', 'Other'];
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment types', error: error.message });
    }
};

// Bookings Management
exports.getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '', search = '', dateFrom = '', dateTo = '' } = req.query;
        
        const query = {};
        
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { bookingId: { $regex: search, $options: 'i' } },
                { 'eventDetails.venue': { $regex: search, $options: 'i' } }
            ];
        }
        
        if (dateFrom && dateTo) {
            query.startDate = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo)
            };
        }
        
        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('equipmentList.equipmentId', 'name type brand')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Booking.countDocuments(query);
        
        res.json({
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate('customerId', 'name email phone address')
            .populate('equipmentList.equipmentId', 'name type brand model image_url')
            .populate('assignedStaff.staffId', 'name email');
            
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            id, 
            { status, adminNotes },
            { new: true }
        ).populate('customerId', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Create notification for customer
        await Notification.create({
            title: `Booking ${status}`,
            message: `Your booking ${booking.bookingId} has been ${status.toLowerCase()}`,
            type: 'booking',
            recipientType: 'customer',
            recipientId: booking.customerId._id,
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });
        
        res.json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error updating booking status', error: error.message });
    }
};

exports.assignStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedStaff } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            id,
            { assignedStaff },
            { new: true }
        ).populate('customerId', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Notify customer about staff assignment
        await Notification.create({
            title: 'Staff Assigned',
            message: `Staff has been assigned to your booking ${booking.bookingId}`,
            type: 'booking',
            recipientType: 'customer',
            recipientId: booking.customerId._id,
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });
        
        res.json({ message: 'Staff assigned successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error assigning staff', error: error.message });
    }
};

// Update booking payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus, advanceAmount, remainingAmount } = req.body;
        
        const updateData = { paymentStatus };
        if (advanceAmount !== undefined) {
            updateData['pricing.advanceAmount'] = advanceAmount;
        }
        if (remainingAmount !== undefined) {
            updateData['pricing.remainingAmount'] = remainingAmount;
        }
        
        const booking = await Booking.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('customerId', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Notify customer
        await Notification.create({
            title: 'Payment Status Updated',
            message: `Payment status for booking ${booking.bookingId} has been updated to ${paymentStatus}`,
            type: 'payment',
            recipientType: 'customer',
            recipientId: booking.customerId._id,
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });
        
        res.json({ message: 'Payment status updated successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment status', error: error.message });
    }
};

// Mark booking as in progress
exports.startBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const booking = await Booking.findByIdAndUpdate(
            id,
            { status: 'In Progress' },
            { new: true }
        ).populate('customerId', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await Notification.create({
            title: 'Booking Started',
            message: `Your booking ${booking.bookingId} is now in progress`,
            type: 'booking',
            recipientType: 'customer',
            recipientId: booking.customerId._id,
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });
        
        res.json({ message: 'Booking started successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error starting booking', error: error.message });
    }
};

// Complete booking
exports.completeBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { completionNotes } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            id,
            { 
                status: 'Completed',
                adminNotes: completionNotes || booking.adminNotes
            },
            { new: true }
        ).populate('customerId', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await Notification.create({
            title: 'Booking Completed',
            message: `Your booking ${booking.bookingId} has been completed`,
            type: 'booking',
            recipientType: 'customer',
            recipientId: booking.customerId._id,
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });
        
        res.json({ message: 'Booking completed successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error completing booking', error: error.message });
    }
};

// Update equipment return status
exports.updateEquipmentReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { equipmentReturnStatus, equipmentReturnDate, damageReport } = req.body;
        
        const updateData = {};
        if (equipmentReturnStatus) updateData.equipmentReturnStatus = equipmentReturnStatus;
        if (equipmentReturnDate) updateData.equipmentReturnDate = equipmentReturnDate;
        if (damageReport) updateData.damageReport = damageReport;
        
        const booking = await Booking.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('customerId', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Notify customer about return status
        await Notification.create({
            title: 'Equipment Return Update',
            message: `Equipment return status for booking ${booking.bookingId}: ${equipmentReturnStatus}`,
            type: 'booking',
            recipientType: 'customer',
            recipientId: booking.customerId._id,
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });
        
        res.json({ message: 'Equipment return status updated successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error updating equipment return', error: error.message });
    }
};

// Get booking statistics
exports.getBookingStats = async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        
        // Status breakdown
        const statusCounts = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Booking type breakdown
        const typeCounts = await Booking.aggregate([
            {
                $group: {
                    _id: '$bookingType',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Monthly revenue
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $nin: ['Cancelled', 'Refunded'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pricing.totalAmount' }
                }
            }
        ]);
        
        // Yearly revenue
        const yearlyRevenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear },
                    status: { $nin: ['Cancelled', 'Refunded'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pricing.totalAmount' }
                }
            }
        ]);
        
        // Upcoming bookings
        const upcomingBookings = await Booking.countDocuments({
            startDate: { $gte: currentDate },
            status: { $in: ['Pending', 'Confirmed'] }
        });
        
        // Overdue returns
        const overdueReturns = await Booking.countDocuments({
            equipmentReturnStatus: 'Pending',
            endDate: { $lt: currentDate }
        });
        
        res.json({
            statusBreakdown: statusCounts,
            typeBreakdown: typeCounts,
            revenue: {
                monthly: monthlyRevenue[0]?.total || 0,
                yearly: yearlyRevenue[0]?.total || 0
            },
            upcomingBookings,
            overdueReturns
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking statistics', error: error.message });
    }
};

// Customer Management
exports.getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', isBlacklisted = '' } = req.query;
        
        const query = { role: 'customer' };
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (isBlacklisted !== '') {
            query.isBlacklisted = isBlacklisted === 'true';
        }
        
        const customers = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await User.countDocuments(query);
        
        res.json({
            customers,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await User.findById(id).select('-password');
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Get customer's booking history
        const bookings = await Booking.find({ customerId: id })
            .populate('equipmentList.equipmentId', 'name type')
            .sort({ createdAt: -1 })
            .limit(10);
            
        // Get customer's payment history
        const payments = await Payment.find({ customerId: id })
            .sort({ paymentDate: -1 })
            .limit(10);
            
        res.json({
            customer,
            recentBookings: bookings,
            recentPayments: payments
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer details', error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        delete updateData.password; // Don't allow password updates through this endpoint
        
        const customer = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        res.status(400).json({ message: 'Error updating customer', error: error.message });
    }
};

exports.blacklistCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlacklisted, blacklistReason } = req.body;
        
        const customer = await User.findByIdAndUpdate(
            id,
            { isBlacklisted, blacklistReason },
            { new: true }
        ).select('-password');
        
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        const action = isBlacklisted ? 'blacklisted' : 'removed from blacklist';
        res.json({ message: `Customer ${action} successfully`, customer });
    } catch (error) {
        res.status(400).json({ message: 'Error updating customer status', error: error.message });
    }
};

// Payment Management
exports.getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '', paymentType = '', dateFrom = '', dateTo = '' } = req.query;
        
        const query = {};
        
        if (status) query.status = status;
        if (paymentType) query.paymentType = paymentType;
        
        if (dateFrom && dateTo) {
            query.paymentDate = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo)
            };
        }
        
        const payments = await Payment.find(query)
            .populate('customerId', 'name email')
            .populate('bookingId', 'bookingId eventType')
            .sort({ paymentDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Payment.countDocuments(query);
        
        res.json({
            payments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
};

exports.addManualPayment = async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();
        
        // Update booking payment status if applicable
        if (payment.bookingId) {
            const booking = await Booking.findById(payment.bookingId);
            if (booking) {
                const totalPaid = await Payment.aggregate([
                    { $match: { bookingId: payment.bookingId, status: 'Completed' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                
                const paidAmount = totalPaid[0]?.total || 0;
                let paymentStatus = 'Pending';
                
                if (paidAmount >= booking.pricing.totalAmount) {
                    paymentStatus = 'Fully Paid';
                } else if (paidAmount > 0) {
                    paymentStatus = 'Advance Paid';
                }
                
                await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus });
            }
        }
        
        res.status(201).json({ message: 'Payment added successfully', payment });
    } catch (error) {
        res.status(400).json({ message: 'Error adding payment', error: error.message });
    }
};

// Subscription Plans Management
exports.getAllSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find()
            .populate('includedEquipment.equipmentId', 'name type brand')
            .sort({ priority: 1 });
            
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subscription plans', error: error.message });
    }
};

exports.addSubscriptionPlan = async (req, res) => {
    try {
        const plan = new SubscriptionPlan(req.body);
        await plan.save();
        res.status(201).json({ message: 'Subscription plan created successfully', plan });
    } catch (error) {
        res.status(400).json({ message: 'Error creating subscription plan', error: error.message });
    }
};

exports.updateSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!plan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }
        
        res.json({ message: 'Subscription plan updated successfully', plan });
    } catch (error) {
        res.status(400).json({ message: 'Error updating subscription plan', error: error.message });
    }
};

exports.deleteSubscriptionPlan = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if any active subscriptions are using this plan
        const activeSubscriptions = await CustomerSubscription.countDocuments({
            subscriptionPlanId: id,
            status: 'Active'
        });
        
        if (activeSubscriptions > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete plan with active subscriptions. Disable it instead.' 
            });
        }
        
        const plan = await SubscriptionPlan.findByIdAndDelete(id);
        
        if (!plan) {
            return res.status(404).json({ message: 'Subscription plan not found' });
        }
        
        res.json({ message: 'Subscription plan deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting subscription plan', error: error.message });
    }
};

// Notifications Management
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, isRead = '', type = '' } = req.query;
        
        const query = { recipientType: { $in: ['admin', 'all'] } };
        
        if (isRead !== '') {
            query.isRead = isRead === 'true';
        }
        
        if (type) {
            query.type = type;
        }
        
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
        
        res.json({
            notifications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error: error.message });
    }
};

// Reports and Analytics
exports.getRevenueReport = async (req, res) => {
    try {
        const { period = 'month', year = new Date().getFullYear() } = req.query;
        
        let groupBy, dateFormat;
        
        if (period === 'month') {
            groupBy = { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } };
            dateFormat = '%Y-%m';
        } else if (period === 'week') {
            groupBy = { year: { $year: '$paymentDate' }, week: { $week: '$paymentDate' } };
            dateFormat = '%Y-W%V';
        } else {
            groupBy = { year: { $year: '$paymentDate' }, day: { $dayOfYear: '$paymentDate' } };
            dateFormat = '%Y-%j';
        }
        
        const revenue = await Payment.aggregate([
            {
                $match: {
                    status: 'Completed',
                    paymentDate: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${parseInt(year) + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } }
        ]);
        
        res.json(revenue);
    } catch (error) {
        res.status(500).json({ message: 'Error generating revenue report', error: error.message });
    }
};

exports.getBookingReport = async (req, res) => {
    try {
        const { period = 'month', year = new Date().getFullYear() } = req.query;
        
        // Booking status distribution
        const statusDistribution = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${parseInt(year) + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Equipment type popularity
        const equipmentPopularity = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${parseInt(year) + 1}-01-01`)
                    }
                }
            },
            { $unwind: '$equipmentList' },
            {
                $lookup: {
                    from: 'equipment',
                    localField: 'equipmentList.equipmentId',
                    foreignField: '_id',
                    as: 'equipment'
                }
            },
            { $unwind: '$equipment' },
            {
                $group: {
                    _id: '$equipment.type',
                    bookings: { $sum: 1 },
                    revenue: { $sum: { $multiply: ['$equipmentList.quantity', '$equipmentList.dailyRate', '$equipmentList.totalDays'] } }
                }
            },
            { $sort: { bookings: -1 } }
        ]);
        
        res.json({
            statusDistribution,
            equipmentPopularity
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating booking report', error: error.message });
    }
};

// ============ CUSTOMER MANAGEMENT ============

// Get all customers with search and filtering
exports.getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const query = { role: 'customer' };
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status === 'active') {
            query.isBlacklisted = false;
        } else if (status === 'blacklisted') {
            query.isBlacklisted = true;
        } else if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'unverified') {
            query.isVerified = false;
        }
        
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const customers = await User.find(query)
            .select('-password')
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await User.countDocuments(query);
        
        // Get additional stats for each customer
        const customersWithStats = await Promise.all(customers.map(async (customer) => {
            const customerObj = customer.toObject();
            
            // Get booking count and total spent
            const bookingStats = await Booking.aggregate([
                { $match: { customerId: customer._id } },
                {
                    $group: {
                        _id: null,
                        totalBookings: { $sum: 1 },
                        totalSpent: { $sum: '$pricing.totalAmount' },
                        lastBooking: { $max: '$createdAt' }
                    }
                }
            ]);
            
            // Get current subscription
            const currentSubscription = await CustomerSubscription.findOne({
                customerId: customer._id,
                status: 'Active'
            }).populate('subscriptionPlanId', 'displayName planType');
            
            customerObj.stats = {
                totalBookings: bookingStats[0]?.totalBookings || 0,
                totalSpent: bookingStats[0]?.totalSpent || 0,
                lastBooking: bookingStats[0]?.lastBooking || null,
                currentSubscription: currentSubscription || null
            };
            
            return customerObj;
        }));
        
        res.json({
            customers: customersWithStats,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total,
            summary: {
                totalCustomers: await User.countDocuments({ role: 'customer' }),
                activeCustomers: await User.countDocuments({ role: 'customer', isBlacklisted: false }),
                blacklistedCustomers: await User.countDocuments({ role: 'customer', isBlacklisted: true }),
                verifiedCustomers: await User.countDocuments({ role: 'customer', isVerified: true })
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

// Get single customer details
exports.getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const customer = await User.findById(id).select('-password');
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Get customer's bookings
        const bookingDocs = await Booking.find({ customerId: id })
            .populate('equipmentList.equipmentId', 'name type')
            .sort({ createdAt: -1 })
            .limit(10);
        
        const bookings = bookingDocs.map((booking) => {
            const bookingObj = booking.toObject();
            bookingObj.totalAmount = bookingObj.totalAmount ?? bookingObj.pricing?.totalAmount ?? 0;
            return bookingObj;
        });
        
        // Get customer's payments
        const payments = await Payment.find({ customerId: id })
            .sort({ paymentDate: -1 })
            .limit(10);
        
        // Get customer's subscriptions
        const subscriptions = await CustomerSubscription.find({ customerId: id })
            .populate('subscriptionPlanId', 'displayName planType price duration')
            .sort({ createdAt: -1 });
        
        const paymentTotal = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const bookingTotalAmount = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        
        // Calculate stats
        const stats = {
            totalBookings: bookings.length,
            totalSpent: paymentTotal,
            activeSubscriptions: subscriptions.filter(sub => sub.status === 'Active').length,
            lastBookingDate: bookings[0]?.createdAt || null,
            averageOrderValue: bookings.length > 0 ? bookingTotalAmount / bookings.length : 0
        };
        
        res.json({
            customer,
            bookings,
            payments,
            subscriptions,
            stats
        });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).json({ message: 'Error fetching customer details', error: error.message });
    }
};

// Update customer information
exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.password;
        delete updateData.role;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        
        const customer = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        res.json({
            message: 'Customer updated successfully',
            customer
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ message: 'Error updating customer', error: error.message });
    }
};

// Toggle customer blacklist status
exports.toggleCustomerBlacklist = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason = '' } = req.body;
        
        const customer = await User.findById(id);
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        customer.isBlacklisted = !customer.isBlacklisted;
        if (customer.isBlacklisted) {
            customer.blacklistReason = reason;
        } else {
            customer.blacklistReason = '';
        }
        
        await customer.save();
        
        // Create notification for customer
        await Notification.create({
            title: customer.isBlacklisted ? 'Account Suspended' : 'Account Reactivated',
            message: customer.isBlacklisted
                ? `Your account has been suspended. Reason: ${reason}`
                : 'Your account has been reactivated. You can now access all services.',
            type: customer.isBlacklisted ? 'alert' : 'system',
            recipientType: 'customer',
            recipientId: customer._id,
            relatedEntityType: 'customer',
            relatedEntityId: customer._id
        });
        
        res.json({
            message: `Customer ${customer.isBlacklisted ? 'blacklisted' : 'removed from blacklist'} successfully`,
            customer: { ...customer.toObject(), password: undefined }
        });
    } catch (error) {
        console.error('Error toggling customer blacklist:', error);
        res.status(500).json({ message: 'Error updating customer status', error: error.message });
    }
};

// Verify customer account
exports.verifyCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        
        const customer = await User.findByIdAndUpdate(
            id,
            { isVerified: true },
            { new: true }
        ).select('-password');
        
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        // Create notification for customer
        await Notification.create({
            title: 'Account Verified',
            message: 'Your account has been successfully verified. You now have access to all premium features.',
            type: 'system',
            recipientType: 'customer',
            recipientId: customer._id,
            relatedEntityType: 'customer',
            relatedEntityId: customer._id
        });
        
        res.json({
            message: 'Customer verified successfully',
            customer
        });
    } catch (error) {
        console.error('Error verifying customer:', error);
        res.status(500).json({ message: 'Error verifying customer', error: error.message });
    }
};

// Get customer statistics
exports.getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const activeCustomers = await User.countDocuments({ role: 'customer', isBlacklisted: false });
        const verifiedCustomers = await User.countDocuments({ role: 'customer', isVerified: true });
        const blacklistedCustomers = await User.countDocuments({ role: 'customer', isBlacklisted: true });
        
        // Monthly registration trend
        const monthlyRegistrations = await User.aggregate([
            {
                $match: {
                    role: 'customer',
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);
        
        // Top customers by spending
        const topCustomers = await Booking.aggregate([
            {
                $group: {
                    _id: '$customerId',
                    totalSpent: { $sum: '$totalAmount' },
                    totalBookings: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    customerName: '$customer.name',
                    customerEmail: '$customer.email',
                    totalSpent: 1,
                    totalBookings: 1
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 }
        ]);
        
        res.json({
            overview: {
                totalCustomers,
                activeCustomers,
                verifiedCustomers,
                blacklistedCustomers,
                verificationRate: totalCustomers > 0 ? ((verifiedCustomers / totalCustomers) * 100).toFixed(1) : 0
            },
            monthlyRegistrations,
            topCustomers
        });
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({ message: 'Error fetching customer statistics', error: error.message });
    }
};

// Settings Management
exports.getSettings = async (req, res) => {
    try {
        const { category = '' } = req.query;
        
        const query = {};
        if (category) {
            query.category = category;
        }
        
        const settings = await AdminSettings.find(query).sort({ category: 1, settingKey: 1 });
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        const updatedSettings = [];
        
        for (const setting of settings) {
            const { settingKey, settingValue, settingType, category, description, isPublic } = setting;
            
            const updatedSetting = await AdminSettings.findOneAndUpdate(
                { settingKey },
                {
                    settingValue,
                    settingType,
                    category,
                    description,
                    isPublic,
                    lastModifiedBy: req.user._id
                },
                { new: true, upsert: true }
            );
            
            updatedSettings.push(updatedSetting);
        }
        
        res.json({
            message: 'Settings updated successfully',
            settings: updatedSettings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};

exports.getSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        
        const setting = await AdminSettings.findOne({ settingKey: key });
        
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        
        res.json(setting);
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ message: 'Error fetching setting', error: error.message });
    }
};

exports.updateSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const { settingValue, settingType, category, description, isPublic } = req.body;
        
        const setting = await AdminSettings.findOneAndUpdate(
            { settingKey: key },
            {
                settingValue,
                settingType,
                category,
                description,
                isPublic,
                lastModifiedBy: req.user._id
            },
            { new: true, upsert: true }
        );
        
        res.json({
            message: 'Setting updated successfully',
            setting
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ message: 'Error updating setting', error: error.message });
    }
};

// ============ REPORTS AND ANALYTICS ============

// Get all payment requests (admin)
exports.getPaymentRequests = async (req, res) => {
    try {
        const { status = '', page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status) filter['paymentRequests.status'] = status;
        
        // Aggregation pipeline to get bookings with payment requests
        const pipeline = [
            { $unwind: '$paymentRequests' },
            { $match: filter },
            { 
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            { $sort: { 'paymentRequests.requestDate': -1 } },
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
        ];
        
        const paymentRequests = await Booking.aggregate(pipeline);
        
        // Get total count
        const totalCountPipeline = [
            { $unwind: '$paymentRequests' },
            { $match: filter },
            { $count: 'total' }
        ];
        
        const totalCountResult = await Booking.aggregate(totalCountPipeline);
        const total = totalCountResult[0]?.total || 0;
        
        res.json({
            success: true,
            data: {
                paymentRequests,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get payment requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching payment requests', 
            error: error.message 
        });
    }
};

// Process payment request (admin)
exports.processPaymentRequest = async (req, res) => {
    try {
        const { bookingId, requestId } = req.params;
        const { status, adminNotes } = req.body;
        
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status. Must be Accepted or Rejected' 
            });
        }
        
        let booking = null;
        if (mongoose.Types.ObjectId.isValid(bookingId)) {
            booking = await Booking.findById(bookingId);
        }
        if (!booking) {
            booking = await Booking.findOne({ bookingId });
        }
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }
        
        let paymentRequest = booking.paymentRequests.id(requestId);
        if (!paymentRequest) {
            paymentRequest = booking.paymentRequests.find((request) => request._id?.toString() === requestId);
        }
        if (!paymentRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment request not found' 
            });
        }
        
        // Check if request is already processed
        if (paymentRequest.status !== 'Pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment request already processed' 
            });
        }
        
        // Update payment request
        paymentRequest.status = status;
        paymentRequest.adminNotes = adminNotes;
        paymentRequest.processedDate = new Date();
        
        // If accepted, create actual payment record and update booking
        if (status === 'Accepted') {
            const Payment = require('../models/Payment');

            // Generate payment ID
            const count = await Payment.countDocuments();
            const paymentId = `PAY${Date.now()}${(count + 1).toString().padStart(3, '0')}`;

            // Create payment record
            const payment = new Payment({
                paymentId: paymentId,
                bookingId: booking._id,
                customerId: booking.customerId,
                amount: paymentRequest.amount,
                paymentType: paymentRequest.amount >= booking.pricing.totalAmount ? 'Full Payment' : 'Advance',
                paymentMethod: paymentRequest.paymentMethod,
                status: 'Completed',
                description: `Payment for booking ${booking.bookingId}`,
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
            
            if (paidAmount >= booking.pricing.totalAmount) {
                booking.paymentStatus = 'Fully Paid';
            } else if (paidAmount > 0) {
                booking.paymentStatus = 'Advance Paid';
            }
            
            booking.pricing.remainingAmount = booking.pricing.totalAmount - paidAmount;
        }
        
        await booking.save();
        
        // Create notification for customer
        await Notification.create({
            title: `Payment Request ${status}`,
            message: `Your payment request of ₹${paymentRequest.amount} for booking ${booking.bookingId} has been ${status.toLowerCase()}`,
            type: 'payment',
            recipientType: 'customer',
            recipientId: booking.customerId,
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });
        
        res.json({
            success: true,
            message: `Payment request ${status.toLowerCase()} successfully`,
            data: paymentRequest
        });
    } catch (error) {
        console.error('Process payment request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing payment request', 
            error: error.message 
        });
    }
};

// Get payment requests for specific booking (admin)
exports.getBookingPaymentRequests = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find booking
        const booking = await Booking.findById(id)
            .select('paymentRequests')
            .populate('customerId', 'name email');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }
        
        res.json({
            success: true,
            data: booking.paymentRequests
        });
    } catch (error) {
        console.error('Get booking payment requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment requests',
            error: error.message
        });
    }
};

// Reports and Analytics Functions
exports.getRevenueReport = async (req, res) => {
    try {
        const { period = 'monthly', startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                paymentDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            // Default to current year
            const currentYear = new Date().getFullYear();
            dateFilter = {
                paymentDate: {
                    $gte: new Date(currentYear, 0, 1),
                    $lte: new Date(currentYear, 11, 31)
                }
            };
        }

        // Revenue by period
        let groupBy;
        if (period === 'daily') {
            groupBy = {
                $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" }
            };
        } else if (period === 'monthly') {
            groupBy = {
                $dateToString: { format: "%Y-%m", date: "$paymentDate" }
            };
        } else if (period === 'yearly') {
            groupBy = {
                $dateToString: { format: "%Y", date: "$paymentDate" }
            };
        }

        const revenueData = await Payment.aggregate([
            { $match: { status: 'Completed', ...dateFilter } },
            {
                $group: {
                    _id: groupBy,
                    totalRevenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 },
                    averageTransaction: { $avg: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Revenue by payment method
        const revenueByMethod = await Payment.aggregate([
            { $match: { status: 'Completed', ...dateFilter } },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalRevenue: { $sum: '$amount' },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Revenue by subscription plan
        const revenueByPlan = await CustomerSubscription.aggregate([
            { $match: { status: 'Active', createdAt: dateFilter.paymentDate } },
            {
                $lookup: {
                    from: 'subscriptionplans',
                    localField: 'subscriptionPlanId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            { $unwind: '$plan' },
            {
                $group: {
                    _id: '$plan.displayName',
                    totalRevenue: { $sum: '$amountPaid' },
                    subscriptionCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Total summary
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'Completed', ...dateFilter } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                summary: {
                    totalRevenue: totalRevenue[0]?.total || 0,
                    totalTransactions: totalRevenue[0]?.count || 0,
                    averageTransaction: totalRevenue[0] ? totalRevenue[0].total / totalRevenue[0].count : 0
                },
                revenueTrends: revenueData,
                revenueByMethod,
                revenueByPlan
            }
        });
    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating revenue report',
            error: error.message
        });
    }
};

exports.getBookingReport = async (req, res) => {
    try {
        const { period = 'monthly', startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            // Default to current year
            const currentYear = new Date().getFullYear();
            dateFilter = {
                createdAt: {
                    $gte: new Date(currentYear, 0, 1),
                    $lte: new Date(currentYear, 11, 31)
                }
            };
        }

        // Booking trends by period
        let groupBy;
        if (period === 'daily') {
            groupBy = {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            };
        } else if (period === 'monthly') {
            groupBy = {
                $dateToString: { format: "%Y-%m", date: "$createdAt" }
            };
        } else if (period === 'yearly') {
            groupBy = {
                $dateToString: { format: "%Y", date: "$createdAt" }
            };
        }

        const bookingTrends = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: groupBy,
                    totalBookings: { $sum: 1 },
                    confirmedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] }
                    },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Bookings by status
        const bookingsByStatus = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Bookings by event type
        const bookingsByEventType = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' },
                    averageRevenue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Customer booking frequency
        const customerBookingFrequency = await Booking.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$customerId',
                    bookingCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    customerName: '$customer.name',
                    customerEmail: '$customer.email',
                    bookingCount: 1,
                    totalSpent: 1,
                    averageSpent: { $divide: ['$totalSpent', '$bookingCount'] }
                }
            },
            { $sort: { bookingCount: -1 } },
            { $limit: 20 }
        ]);

        // Total summary
        const totalBookings = await Booking.countDocuments(dateFilter);
        const totalRevenue = await Booking.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            success: true,
            data: {
                summary: {
                    totalBookings,
                    totalRevenue: totalRevenue[0]?.total || 0,
                    averageBookingValue: totalBookings > 0 ? (totalRevenue[0]?.total || 0) / totalBookings : 0
                },
                bookingTrends,
                bookingsByStatus,
                bookingsByEventType,
                topCustomers: customerBookingFrequency
            }
        });
    } catch (error) {
        console.error('Booking report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating booking report',
            error: error.message
        });
    }
};

exports.getCustomerReport = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        // Customer acquisition trends
        const currentYear = new Date().getFullYear();
        const customerTrends = await User.aggregate([
            {
                $match: {
                    role: 'customer',
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    newCustomers: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Customer status distribution
        const customerStatus = await User.aggregate([
            { $match: { role: 'customer' } },
            {
                $lookup: {
                    from: 'customersubscriptions',
                    localField: '_id',
                    foreignField: 'customerId',
                    as: 'subscriptions'
                }
            },
            {
                $addFields: {
                    hasActiveSubscription: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: '$subscriptions',
                                        cond: { $eq: ['$$this.status', 'Active'] }
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$hasActiveSubscription',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Customer lifetime value
        const customerLifetimeValue = await Booking.aggregate([
            {
                $group: {
                    _id: '$customerId',
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    lastBooking: { $max: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    customerName: '$customer.name',
                    customerEmail: '$customer.email',
                    totalBookings: 1,
                    totalSpent: 1,
                    averageOrderValue: { $divide: ['$totalSpent', '$totalBookings'] },
                    lastBooking: 1
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 20 }
        ]);

        // Total customer stats
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const activeCustomers = await User.aggregate([
            { $match: { role: 'customer' } },
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'customerId',
                    as: 'bookings'
                }
            },
            {
                $match: {
                    'bookings.0': { $exists: true }
                }
            },
            { $count: 'active' }
        ]);

        res.json({
            success: true,
            data: {
                summary: {
                    totalCustomers,
                    activeCustomers: activeCustomers[0]?.active || 0,
                    inactiveCustomers: totalCustomers - (activeCustomers[0]?.active || 0)
                },
                customerTrends,
                customerStatus,
                topCustomersByValue: customerLifetimeValue
            }
        });
    } catch (error) {
        console.error('Customer report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating customer report',
            error: error.message
        });
    }
};

exports.getEquipmentReport = async (req, res) => {
    try {
        // Equipment usage statistics (simplified since we don't have detailed rental tracking)
        const equipmentStats = await Camera.find().select('name price rating');

        // Most popular equipment types (based on bookings that mention equipment)
        const equipmentUsage = await Booking.aggregate([
            { $unwind: '$equipment' },
            {
                $group: {
                    _id: '$equipment.name',
                    usageCount: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { usageCount: -1 } },
            { $limit: 10 }
        ]);

        // Equipment revenue contribution
        const equipmentRevenue = await Booking.aggregate([
            { $unwind: '$equipment' },
            {
                $group: {
                    _id: '$equipment.name',
                    totalRevenue: { $sum: '$equipment.price' },
                    bookingCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                equipmentStats,
                equipmentUsage,
                equipmentRevenue
            }
        });
    } catch (error) {
        console.error('Equipment report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating equipment report',
            error: error.message
        });
    }
};
