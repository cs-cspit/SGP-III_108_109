const Booking = require('../models/Booking');
const Camera = require('../models/dataModel');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SubscriptionPlan = require('../models/SubscriptionPlan');

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
            startTime,
            endTime,
            eventDetails,
            specialRequirements,
            subscriptionPlanId,
            totalDays,
            totalHours,
            includeHours
        } = req.body;

        // Calculate total days if not provided
        let calculatedTotalDays = totalDays;
        if (!calculatedTotalDays) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            calculatedTotalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }

        // Calculate equipment pricing
        let equipmentTotal = 0;
        const enrichedEquipmentList = [];

        // Handle equipment list - could be from EquipmentBooking or other sources
        const equipmentData = equipmentList || [];
        
        for (const item of equipmentData) {
            // Equipment ID could be in different locations
            const equipmentId = item.equipmentId || item._id;
            const equipment = await Camera.findById(equipmentId);
            if (!equipment) {
                return res.status(404).json({ message: `Equipment not found: ${equipmentId}` });
            }
            
            const dailyRate = equipment.price * 0.1; // 10% of equipment price as daily rate
            const quantity = item.quantity || 1;
            let itemTotal = dailyRate * quantity * calculatedTotalDays;
            
            // Add hourly charges if applicable
            if (includeHours && totalHours > 0) {
                const hourlyRate = dailyRate * 0.15; // 15% of daily rate as hourly rate
                itemTotal += hourlyRate * quantity * totalHours;
            }
            
            equipmentTotal += itemTotal;

            enrichedEquipmentList.push({
                equipmentId: equipment._id,
                quantity: quantity,
                dailyRate,
                totalDays: calculatedTotalDays
            });
        }

        // Handle package/subscription plan if selected
        let packageAmount = 0;
        let packageDetails = null;
        let isSubscriptionBooking = false;

        if (subscriptionPlanId) {
            const plan = await SubscriptionPlan.findById(subscriptionPlanId);
            if (!plan) {
                return res.status(404).json({ message: 'Package not found' });
            }
            if (!plan.isActive) {
                return res.status(400).json({ message: 'Selected package is not available' });
            }

            packageAmount = plan.price;
            isSubscriptionBooking = true;
            packageDetails = {
                name: plan.name,
                planType: plan.planType,
                price: plan.price,
                manpower: {
                    photographers: plan.manpower.photographers || 0,
                    videographers: plan.manpower.videographers || 0,
                    candidPhotographers: plan.manpower.candidPhotographers || 0,
                    cinematographers: plan.manpower.cinematographers || 0,
                    droneOperators: plan.manpower.droneOperators || 0
                }
            };
        }

        // Determine service charges based on booking type
        let serviceCharges = 1000; // Default service charge
        if (bookingType === 'Function Shoot' || bookingType === 'Custom Event Booking') {
            serviceCharges = 5000;
        } else if (bookingType === 'Equipment Rental') {
            serviceCharges = 500; // Lower service charge for equipment rental
        }
        
        const subtotal = equipmentTotal + packageAmount + serviceCharges;
        const taxes = subtotal * 0.18; // 18% GST
        const totalAmount = subtotal + taxes;

        // Prepare event details
        const bookingEventDetails = {
            venue: '',
            address: '',
            contactPerson: '',
            contactPhone: '',
            specialRequirements: '',
            guestCount: 0,
            ...eventDetails
        };
        
        // If we have customer details from equipment booking, use them
        if (req.body.eventDetails && req.body.eventDetails.contactPerson) {
            bookingEventDetails.contactPerson = req.body.eventDetails.contactPerson;
        }
        if (req.body.eventDetails && req.body.eventDetails.contactPhone) {
            bookingEventDetails.contactPhone = req.body.eventDetails.contactPhone;
        }
        if (req.body.eventDetails && req.body.eventDetails.address) {
            bookingEventDetails.address = req.body.eventDetails.address;
        }
        if (req.body.eventDetails && req.body.eventDetails.specialRequirements) {
            bookingEventDetails.specialRequirements = req.body.eventDetails.specialRequirements;
        }

        const booking = new Booking({
            customerId,
            bookingType,
            eventType: eventType || 'Other',
            equipmentList: enrichedEquipmentList,
            startDate,
            endDate,
            totalDays: calculatedTotalDays,
            eventDetails: bookingEventDetails,
            subscriptionPlanId: subscriptionPlanId || null,
            packageDetails: packageDetails,
            isSubscriptionBooking,
            pricing: {
                equipmentTotal,
                packageAmount,
                serviceCharges,
                taxes,
                totalAmount,
                remainingAmount: totalAmount
            },
            customerNotes: specialRequirements || (req.body.eventDetails && req.body.eventDetails.specialRequirements) || ''
        });

        await booking.save();

        // Create notification for admin
        await Notification.create({
            title: 'New Booking Request',
            message: `New ${bookingType} booking request from ${req.user.name}${isSubscriptionBooking ? ` with ${packageDetails.planType} Package` : ''}`,
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

        // Get all equipment
        const allEquipment = await Camera.find().select('name price image_url rating');
        
        // If dates are provided, check availability
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Find bookings that overlap with requested dates
            const overlappingBookings = await Booking.find({
                status: { $in: ['Confirmed', 'In Progress'] },
                $or: [
                    { startDate: { $lte: end }, endDate: { $gte: start } }
                ]
            }).populate('equipmentList.equipmentId');
            
            // Calculate booked quantities for each equipment
            const bookedQuantities = {};
            overlappingBookings.forEach(booking => {
                booking.equipmentList.forEach(item => {
                    const equipmentId = item.equipmentId._id.toString();
                    bookedQuantities[equipmentId] = (bookedQuantities[equipmentId] || 0) + item.quantity;
                });
            });
            
            // Add availability info to equipment
            const equipmentWithAvailability = allEquipment.map(equipment => {
                const equipmentObj = equipment.toObject();
                const bookedQty = bookedQuantities[equipment._id.toString()] || 0;
                equipmentObj.bookedQuantity = bookedQty;
                equipmentObj.isAvailable = bookedQty === 0; // Simplified: assumes 1 unit per equipment
                return equipmentObj;
            });
            
            return res.json(equipmentWithAvailability);
        }
        
        // If no dates provided, return all equipment
        res.json(allEquipment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching equipment', error: error.message });
    }
};

// Check equipment availability for specific items
exports.checkEquipmentAvailability = async (req, res) => {
    try {
        const { equipmentList, startDate, endDate, excludeBookingId } = req.body;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const query = {
            status: { $in: ['Confirmed', 'In Progress'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        };
        
        // Exclude current booking if rescheduling
        if (excludeBookingId) {
            query._id = { $ne: excludeBookingId };
        }
        
        const overlappingBookings = await Booking.find(query);
        
        // Check availability for each requested equipment
        const availabilityResults = [];
        
        for (const requestedItem of equipmentList) {
            let bookedQuantity = 0;
            
            overlappingBookings.forEach(booking => {
                const bookedItem = booking.equipmentList.find(
                    item => item.equipmentId.toString() === requestedItem.equipmentId
                );
                if (bookedItem) {
                    bookedQuantity += bookedItem.quantity;
                }
            });
            
            const equipment = await Camera.findById(requestedItem.equipmentId);
            
            availabilityResults.push({
                equipmentId: requestedItem.equipmentId,
                equipmentName: equipment?.name || 'Unknown',
                requestedQuantity: requestedItem.quantity,
                bookedQuantity,
                available: bookedQuantity === 0 // Simplified check
            });
        }
        
        const allAvailable = availabilityResults.every(item => item.available);
        
        res.json({
            available: allAvailable,
            details: availabilityResults
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking availability', error: error.message });
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

// Create payment request for booking
exports.createPaymentRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, paymentMethod } = req.body;
        const userId = req.user._id;

        // Find booking and verify ownership
        const booking = await Booking.findOne({
            _id: id,
            customerId: userId
        }).populate('customerId', 'name email');

        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or unauthorized' 
            });
        }

        // Validate amount
        if (amount <= 0 || amount > booking.pricing.remainingAmount) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment amount' 
            });
        }

        // Create payment request
        const paymentRequest = {
            amount,
            paymentMethod,
            requestDate: new Date(),
            status: 'Pending'
        };

        booking.paymentRequests.push(paymentRequest);
        await booking.save();

        // Create notification for admin
        await Notification.create({
            title: 'Payment Request',
            message: `New payment request of ₹${amount} for booking ${booking.bookingId}`,
            type: 'payment',
            recipientType: 'admin',
            relatedEntityType: 'booking',
            relatedEntityId: booking._id,
            actionRequired: true
        });

        res.status(201).json({
            success: true,
            message: 'Payment request created successfully',
            data: paymentRequest
        });
    } catch (error) {
        console.error('Create payment request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating payment request', 
            error: error.message 
        });
    }
};

// Get payment requests for user's booking
exports.getPaymentRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find booking and verify ownership
        const booking = await Booking.findOne({
            _id: id,
            customerId: userId
        }).select('paymentRequests');

        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or unauthorized' 
            });
        }

        res.json({
            success: true,
            data: booking.paymentRequests
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

// Cancel payment request (user)
exports.cancelPaymentRequest = async (req, res) => {
    try {
        const { id, requestId } = req.params;
        const userId = req.user._id;

        // Find booking and verify ownership
        const booking = await Booking.findOne({
            _id: id,
            customerId: userId
        });

        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or unauthorized' 
            });
        }

        // Find payment request
        const paymentRequest = booking.paymentRequests.id(requestId);
        if (!paymentRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment request not found' 
            });
        }

        // Check if request can be cancelled
        if (paymentRequest.status !== 'Pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only pending payment requests can be cancelled' 
            });
        }

        // Remove the payment request
        paymentRequest.remove();
        await booking.save();

        res.json({
            success: true,
            message: 'Payment request cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel payment request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error cancelling payment request', 
            error: error.message 
        });
    }
};
