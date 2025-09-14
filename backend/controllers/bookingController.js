const Booking = require('../models/Booking');
const Camera = require('../models/dataModel');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { 
            bookingType, 
            eventType, 
            equipmentList, 
            startDate, 
            endDate,
            eventDetails,
            specialRequirements 
        } = req.body;

        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Calculate pricing
        let equipmentTotal = 0;
        const enrichedEquipmentList = [];

        for (const item of equipmentList) {
            const equipment = await Camera.findById(item.equipmentId);
            if (!equipment) {
                return res.status(404).json({ message: `Equipment not found: ${item.equipmentId}` });
            }
            
            const dailyRate = equipment.price * 0.1; // 10% of equipment price as daily rate
            const itemTotal = dailyRate * item.quantity * totalDays;
            equipmentTotal += itemTotal;

            enrichedEquipmentList.push({
                equipmentId: equipment._id,
                quantity: item.quantity,
                dailyRate,
                totalDays
            });
        }

        const serviceCharges = bookingType === 'Function Shoot' ? 5000 : 1000;
        const taxes = (equipmentTotal + serviceCharges) * 0.18; // 18% GST
        const totalAmount = equipmentTotal + serviceCharges + taxes;

        const booking = new Booking({
            customerId,
            bookingType,
            eventType,
            equipmentList: enrichedEquipmentList,
            startDate,
            endDate,
            totalDays,
            eventDetails: eventDetails || {},
            pricing: {
                equipmentTotal,
                serviceCharges,
                taxes,
                totalAmount,
                remainingAmount: totalAmount
            },
            customerNotes: specialRequirements || ''
        });

        await booking.save();

        // Create notification for admin
        await Notification.create({
            title: 'New Booking Request',
            message: `New ${bookingType} booking request from ${req.user.name}`,
            type: 'booking',
            recipientType: 'admin',
            relatedEntityType: 'booking',
            relatedEntityId: booking._id,
            actionRequired: true
        });

        res.status(201).json({ 
            message: 'Booking created successfully', 
            booking,
            bookingId: booking.bookingId 
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(400).json({ message: 'Error creating booking', error: error.message });
    }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { customerId };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('equipmentList.equipmentId', 'name image_url')
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

// Get single booking details
exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const query = { _id: id };
        // If not admin, only allow user to see their own bookings
        if (userRole !== 'admin') {
            query.customerId = userId;
        }

        const booking = await Booking.findOne(query)
            .populate('customerId', 'name email phone')
            .populate('equipmentList.equipmentId', 'name image_url price')
            .populate('assignedStaff.staffId', 'name email');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
};

// Cancel booking (user)
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { reason } = req.body;

        const booking = await Booking.findOne({ _id: id, customerId: userId });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!['Pending', 'Confirmed'].includes(booking.status)) {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }

        booking.status = 'Cancelled';
        booking.customerNotes = reason || 'Cancelled by customer';
        await booking.save();

        // Create notification for admin
        await Notification.create({
            title: 'Booking Cancelled',
            message: `Booking ${booking.bookingId} has been cancelled by customer`,
            type: 'booking',
            recipientType: 'admin',
            relatedEntityType: 'booking',
            relatedEntityId: booking._id
        });

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error cancelling booking', error: error.message });
    }
};

// Get available equipment for booking
exports.getAvailableEquipment = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // For now, return all equipment. In a full system, you'd check availability
        const equipment = await Camera.find().select('name price image_url rating');
        
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment', error: error.message });
    }
};

// Reschedule booking (user)
exports.rescheduleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { startDate, endDate, reason } = req.body;

        const booking = await Booking.findOne({ _id: id, customerId: userId });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!['Pending', 'Confirmed'].includes(booking.status)) {
            return res.status(400).json({ message: 'Cannot reschedule this booking' });
        }

        // Calculate new total days and pricing
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Recalculate pricing based on new duration
        let equipmentTotal = 0;
        for (const item of booking.equipmentList) {
            equipmentTotal += item.dailyRate * item.quantity * totalDays;
        }

        const serviceCharges = booking.pricing.serviceCharges;
        const taxes = (equipmentTotal + serviceCharges) * 0.18;
        const totalAmount = equipmentTotal + serviceCharges + taxes;

        booking.startDate = startDate;
        booking.endDate = endDate;
        booking.totalDays = totalDays;
        booking.pricing.equipmentTotal = equipmentTotal;
        booking.pricing.taxes = taxes;
        booking.pricing.totalAmount = totalAmount;
        booking.pricing.remainingAmount = totalAmount;
        booking.status = 'Pending'; // Reset to pending for admin approval
        booking.customerNotes = reason || 'Rescheduled by customer';

        await booking.save();

        // Create notification for admin
        await Notification.create({
            title: 'Booking Rescheduled',
            message: `Booking ${booking.bookingId} has been rescheduled and needs approval`,
            type: 'booking',
            recipientType: 'admin',
            relatedEntityType: 'booking',
            relatedEntityId: booking._id,
            actionRequired: true
        });

        res.json({ message: 'Booking rescheduled successfully', booking });
    } catch (error) {
        res.status(400).json({ message: 'Error rescheduling booking', error: error.message });
    }
};