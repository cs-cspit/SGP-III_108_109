const CustomerSubscription = require('../models/CustomerSubscription');
const Notification = require('../models/Notification');

// Approve subscription request
exports.approveSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;
        const { adminNotes = '' } = req.body;

        const subscription = await CustomerSubscription.findById(id)
            .populate('subscriptionPlanId')
            .populate('customerId', 'name email');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription request not found'
            });
        }

        if (subscription.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve subscription with status: ${subscription.status}`
            });
        }

        // Update subscription status to Active
        subscription.status = 'Active';
        subscription.adminApproval = {
            approvedBy: adminId,
            approvalDate: new Date(),
            adminNotes
        };

        await subscription.save();

        // Create notification for customer
        await Notification.create({
            title: 'Package Subscription Approved',
            message: `Your ${subscription.subscriptionPlanId.planType} package subscription has been approved by admin!`,
            type: 'subscription',
            recipientType: 'customer',
            recipientId: subscription.customerId._id,
            relatedEntityType: 'subscription',
            relatedEntityId: subscription._id,
            actionRequired: false
        });

        res.json({
            success: true,
            message: 'Subscription approved successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Error approving subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving subscription',
            error: error.message
        });
    }
};

// Reject subscription request
exports.rejectSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user._id;
        const { rejectionReason = 'No reason provided', adminNotes = '' } = req.body;

        const subscription = await CustomerSubscription.findById(id)
            .populate('subscriptionPlanId')
            .populate('customerId', 'name email');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription request not found'
            });
        }

        if (subscription.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject subscription with status: ${subscription.status}`
            });
        }

        // Update subscription status to Rejected
        subscription.status = 'Rejected';
        subscription.adminApproval = {
            approvedBy: adminId,
            approvalDate: new Date(),
            rejectionReason,
            adminNotes
        };

        await subscription.save();

        // Create notification for customer
        await Notification.create({
            title: 'Package Subscription Rejected',
            message: `Your ${subscription.subscriptionPlanId.planType} package subscription request has been rejected. Reason: ${rejectionReason}`,
            type: 'subscription',
            recipientType: 'customer',
            recipientId: subscription.customerId._id,
            relatedEntityType: 'subscription',
            relatedEntityId: subscription._id,
            actionRequired: false
        });

        res.json({
            success: true,
            message: 'Subscription rejected successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Error rejecting subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting subscription',
            error: error.message
        });
    }
};

module.exports = exports;
