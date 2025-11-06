const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

// Apply auth middleware to all booking routes
router.use(auth);

// Booking Management
router.post('/create', bookingController.createBooking);
router.get('/my-bookings', bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingDetails);
router.put('/:id/cancel', bookingController.cancelBooking);
router.get('/available-equipment', bookingController.getAvailableEquipment);

// Payment Request Routes (User)
router.post('/:id/payment-request', bookingController.createPaymentRequest);
router.get('/:id/payment-requests', bookingController.getPaymentRequests);
router.delete('/:id/payment-requests/:requestId', bookingController.cancelPaymentRequest);

module.exports = router;