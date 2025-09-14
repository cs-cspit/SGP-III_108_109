const Equipment = require('../models/Equipment');
const Camera = require('../models/dataModel'); // Your existing camera model
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const CustomerSubscription = require('../models/CustomerSubscription');
const Notification = require('../models/Notification');

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
        );
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json({ message: 'Staff assigned successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error assigning staff', error: error.message });
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
                        totalSpent: { $sum: '$totalAmount' },
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
        const bookings = await Booking.find({ customerId: id })
            .populate('equipmentList.equipmentId', 'name type')
            .sort({ createdAt: -1 })
            .limit(10);
            
        // Get customer's payments
        const payments = await Payment.find({ customerId: id })
            .sort({ paymentDate: -1 })
            .limit(10);
            
        // Get customer's subscriptions
        const subscriptions = await CustomerSubscription.find({ customerId: id })
            .populate('subscriptionPlanId', 'displayName planType price duration')
            .sort({ createdAt: -1 });
            
        // Calculate stats
        const stats = {
            totalBookings: bookings.length,
            totalSpent: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
            activeSubscriptions: subscriptions.filter(sub => sub.status === 'Active').length,
            lastBookingDate: bookings[0]?.createdAt || null,
            averageOrderValue: bookings.length > 0 ? payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) / bookings.length : 0
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
        const notification = new Notification({
            userId: customer._id,
            title: customer.isBlacklisted ? 'Account Suspended' : 'Account Reactivated',
            message: customer.isBlacklisted 
                ? `Your account has been suspended. Reason: ${reason}`
                : 'Your account has been reactivated. You can now access all services.',
            type: customer.isBlacklisted ? 'warning' : 'success'
        });
        await notification.save();
        
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
        const notification = new Notification({
            userId: customer._id,
            title: 'Account Verified',
            message: 'Your account has been successfully verified. You now have access to all premium features.',
            type: 'success'
        });
        await notification.save();
        
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