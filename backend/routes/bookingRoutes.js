const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(authMiddleware);

// User booking routes
router.post('/create', bookingController.createBooking);
router.get('/my-bookings', bookingController.getUserBookings);
router.get('/available-equipment', bookingController.getAvailableEquipment);
router.get('/:id', bookingController.getBookingDetails);
router.put('/:id/cancel', bookingController.cancelBooking);
router.put('/:id/reschedule', bookingController.rescheduleBooking);

module.exports = router;