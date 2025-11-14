const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const approvalController = require('../controllers/subscriptionApprovalController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

// ============ ADMIN ROUTES (Protected) ============

// Subscription Plans Management
router.get('/admin/plans', auth, adminAuth, subscriptionController.getAllPlans);
router.post('/admin/plans', auth, adminAuth, subscriptionController.createPlan);
router.put('/admin/plans/:id', auth, adminAuth, subscriptionController.updatePlan);
router.delete('/admin/plans/:id', auth, adminAuth, subscriptionController.deletePlan);

// Customer Subscriptions Management
router.get('/admin/subscriptions', auth, adminAuth, subscriptionController.getAllCustomerSubscriptions);
router.put('/admin/subscriptions/:id/status', auth, adminAuth, subscriptionController.updateSubscriptionStatus);
router.put('/admin/subscriptions/:id/approve', auth, adminAuth, approvalController.approveSubscription);
router.put('/admin/subscriptions/:id/reject', auth, adminAuth, approvalController.rejectSubscription);
router.get('/admin/stats', auth, adminAuth, subscriptionController.getSubscriptionStats);

// ============ USER ROUTES (Protected) ============

// View available plans
router.get('/plans', subscriptionController.getActivePlans);

// User subscription management
router.get('/my-subscription', auth, subscriptionController.getUserSubscription);
router.post('/subscribe', auth, subscriptionController.subscribeToPlan);
router.put('/cancel', auth, subscriptionController.cancelSubscription);

module.exports = router;