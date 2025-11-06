const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard Routes
router.get('/dashboard/stats', adminController.getDashboardStats);

// Equipment Management Routes
router.get('/equipment', adminController.getAllEquipment);
router.post('/equipment', adminController.addEquipment);
router.put('/equipment/:id', adminController.updateEquipment);
router.delete('/equipment/:id', adminController.deleteEquipment);
router.get('/equipment/types', adminController.getEquipmentTypes);

// Booking Management Routes
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.put('/bookings/:id/assign-staff', adminController.assignStaff);

// Customer Management Routes
router.get('/customers', adminController.getAllCustomers);
router.get('/customers/stats', adminController.getCustomerStats);
router.get('/customers/:id', adminController.getCustomerDetails);
router.put('/customers/:id', adminController.updateCustomer);
router.put('/customers/:id/blacklist', adminController.toggleCustomerBlacklist);
router.put('/customers/:id/verify', adminController.verifyCustomer);

// Payment Management Routes
router.get('/payments', adminController.getAllPayments);
router.post('/payments', adminController.addManualPayment);

// Payment Request Routes (Admin)
router.get('/payment-requests', adminController.getPaymentRequests);
router.get('/bookings/:id/payment-requests', adminController.getBookingPaymentRequests);
router.put('/bookings/:bookingId/payment-requests/:requestId', adminController.processPaymentRequest);

// Subscription Plans Management Routes
router.get('/subscription-plans', adminController.getAllSubscriptionPlans);
router.post('/subscription-plans', adminController.addSubscriptionPlan);
router.put('/subscription-plans/:id', adminController.updateSubscriptionPlan);
router.delete('/subscription-plans/:id', adminController.deleteSubscriptionPlan);

// Settings Routes
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/settings/:key', adminController.getSettingByKey);
router.put('/settings/:key', adminController.updateSettingByKey);

// Reports and Analytics Routes
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/bookings', adminController.getBookingReport);

module.exports = router;