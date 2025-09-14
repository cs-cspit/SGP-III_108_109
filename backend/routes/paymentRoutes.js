const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

// ============ ADMIN ROUTES (Protected) ============

// Payment Management
router.get('/admin/payments', auth, adminAuth, paymentController.getAllPayments);
router.get('/admin/payments/statistics', auth, adminAuth, paymentController.getPaymentStatistics);
router.get('/admin/payments/:id', auth, adminAuth, paymentController.getPaymentDetails);
router.post('/admin/payments', auth, adminAuth, paymentController.createManualPayment);
router.put('/admin/payments/:id/status', auth, adminAuth, paymentController.updatePaymentStatus);
router.post('/admin/payments/:id/refund', auth, adminAuth, paymentController.processRefund);

// Invoice Management
router.post('/admin/payments/:id/invoice', auth, adminAuth, paymentController.generateInvoice);

// ============ USER ROUTES (Protected) ============

// User payment history and processing
router.get('/my-payments', auth, paymentController.getUserPayments);
router.post('/booking-payment', auth, paymentController.createBookingPayment);

module.exports = router;