const SubscriptionPlan = require('../models/SubscriptionPlan');
const CustomerSubscription = require('../models/CustomerSubscription');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateOrderId } = require('../utils/helpers');

// ============ ADMIN SUBSCRIPTION PLAN MANAGEMENT ============

// Get all subscription plans
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find()
            .populate('includedEquipment.equipmentId', 'name price')
            .sort({ priority: -1, createdAt: -1 });
        
        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plans',
            error: error.message
        });
    }
};

// Get active subscription plans (for users)
exports.getActivePlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({ isActive: true })
            .populate('includedEquipment.equipmentId', 'name price image_url')
            .sort({ priority: -1, price: 1 });
        
        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Error fetching active plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plans',
            error: error.message
        });
    }
};

// Create new subscription plan
exports.createPlan = async (req, res) => {
    try {
        const {
            name,
            displayName,
            description,
            price,
            duration,
            features,
            includedEquipment,
            includedServices,
            manpower,
            maxBookingsPerMonth,
            discountPercentage,
            planType,
            priority
        } = req.body;

        // Check if plan name already exists
        const existingPlan = await SubscriptionPlan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({
                success: false,
                message: 'Subscription plan with this name already exists'
            });
        }

        const newPlan = new SubscriptionPlan({
            name,
            displayName,
            description,
            price,
            duration,
            features: features || [],
            includedEquipment: includedEquipment || [],
            includedServices: includedServices || [],
            manpower: manpower || {
                photographers: 0,
                videographers: 0,
                candidPhotographers: 0,
                cinematographers: 0,
                droneOperators: 0
            },
            maxBookingsPerMonth: maxBookingsPerMonth || 0,
            discountPercentage: discountPercentage || 0,
            planType,
            priority: priority || 0
        });

        await newPlan.save();
        
        const populatedPlan = await SubscriptionPlan.findById(newPlan._id)
            .populate('includedEquipment.equipmentId', 'name price');

        res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: populatedPlan
        });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subscription plan',
            error: error.message
        });
    }
};

// Update subscription plan
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove _id and timestamps from updateData if present
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('includedEquipment.equipmentId', 'name price');

        if (!updatedPlan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        res.json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: updatedPlan
        });
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subscription plan',
            error: error.message
        });
    }
};

// Delete subscription plan
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any active customer subscriptions exist for this plan
        const activeSubscriptions = await CustomerSubscription.countDocuments({
            subscriptionPlanId: id,
            status: 'Active'
        });

        if (activeSubscriptions > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete plan. ${activeSubscriptions} active customer subscriptions exist.`
            });
        }

        const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
        
        if (!deletedPlan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        res.json({
            success: true,
            message: 'Subscription plan deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subscription plan',
            error: error.message
        });
    }
};

// ============ CUSTOMER SUBSCRIPTION MANAGEMENT ============

// Get user's current subscription
exports.getUserSubscription = async (req, res) => {
    try {
        const userId = req.user.id;

        const subscription = await CustomerSubscription.findOne({
            customerId: userId,
            status: { $in: ['Active', 'Suspended'] }
        })
        .populate('subscriptionPlanId')
        .populate('customerId', 'name email');

        res.json({
            success: true,
            data: subscription
        });
    } catch (error) {
        console.error('Error fetching user subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription details',
            error: error.message
        });
    }
};

// Subscribe to a plan
exports.subscribeToPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const { planId, paymentMethod = 'pending' } = req.body;

        // Check if user already has an active or pending subscription
        const existingSubscription = await CustomerSubscription.findOne({
            customerId: userId,
            status: { $in: ['Active', 'Pending'] }
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: existingSubscription.status === 'Pending' 
                    ? 'You already have a pending subscription request. Please wait for admin approval.'
                    : 'You already have an active subscription. Please cancel or upgrade your current plan.'
            });
        }

        // Get the subscription plan
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Package not found or inactive'
            });
        }

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration);

        // Create new subscription with Pending status
        const subscription = new CustomerSubscription({
            customerId: userId,
            subscriptionPlanId: planId,
            startDate,
            endDate,
            status: 'Pending',  // Set to pending for admin approval
            amountPaid: plan.price,
            maxBookingsAllowed: plan.maxBookingsPerMonth,
            paymentStatus: paymentMethod === 'mock' ? 'Paid' : 'Pending'
        });

        await subscription.save();

        // Get user details for notification
        const user = await User.findById(userId).select('name email');

        // Create notification for admin
        await Notification.create({
            title: 'New Package Subscription Request',
            message: `${user.name} has requested ${plan.planType} package subscription (${plan.displayName})`,
            type: 'subscription',
            recipientType: 'admin',
            relatedEntityType: 'subscription',
            relatedEntityId: subscription._id,
            actionRequired: true
        });

        // Populate and return
        const populatedSubscription = await CustomerSubscription.findById(subscription._id)
            .populate('subscriptionPlanId')
            .populate('customerId', 'name email');

        res.status(201).json({
            success: true,
            message: 'Package subscription request submitted successfully. Waiting for admin approval.',
            data: populatedSubscription
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error creating subscription',
            error: error.message
        });
    }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reason = 'User requested cancellation' } = req.body;

        const subscription = await CustomerSubscription.findOne({
            customerId: userId,
            status: 'Active'
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'No active subscription found'
            });
        }

        subscription.status = 'Cancelled';
        subscription.cancellationDate = new Date();
        subscription.cancellationReason = reason;
        subscription.autoRenewal = false;

        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription',
            error: error.message
        });
    }
};

// ============ ADMIN CUSTOMER SUBSCRIPTION MANAGEMENT ============

// Get all customer subscriptions
exports.getAllCustomerSubscriptions = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const subscriptions = await CustomerSubscription.find(filter)
            .populate('customerId', 'name email phone')
            .populate('subscriptionPlanId', 'name displayName planType price duration')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CustomerSubscription.countDocuments(filter);

        res.json({
            success: true,
            data: {
                subscriptions,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        console.error('Error fetching customer subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer subscriptions',
            error: error.message
        });
    }
};

// Update customer subscription status
exports.updateSubscriptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const subscription = await CustomerSubscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        subscription.status = status;
        if (notes) subscription.notes = notes;
        
        if (status === 'Cancelled' && !subscription.cancellationDate) {
            subscription.cancellationDate = new Date();
            subscription.cancellationReason = 'Admin action';
        }

        await subscription.save();

        const updatedSubscription = await CustomerSubscription.findById(id)
            .populate('customerId', 'name email')
            .populate('subscriptionPlanId', 'name planType');

        res.json({
            success: true,
            message: 'Subscription status updated successfully',
            data: updatedSubscription
        });
    } catch (error) {
        console.error('Error updating subscription status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subscription status',
            error: error.message
        });
    }
};

// Get subscription statistics
exports.getSubscriptionStats = async (req, res) => {
    try {
        const stats = await CustomerSubscription.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$amountPaid' }
                }
            }
        ]);

        const planStats = await CustomerSubscription.aggregate([
            {
                $lookup: {
                    from: 'subscriptionplans',
                    localField: 'subscriptionPlanId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            {
                $unwind: '$plan'
            },
            {
                $group: {
                    _id: '$plan.planType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amountPaid' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalSubscriptions = await CustomerSubscription.countDocuments();
        const activeSubscriptions = await CustomerSubscription.countDocuments({ status: 'Active' });
        const totalRevenue = await CustomerSubscription.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]);

        res.json({
            success: true,
            data: {
                statusStats: stats,
                planStats,
                totalSubscriptions,
                activeSubscriptions,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Error fetching subscription stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription statistics',
            error: error.message
        });
    }
};