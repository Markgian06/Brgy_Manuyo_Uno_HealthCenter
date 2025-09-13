// appointmentMiddleware.js with validation for create and update operations
import mongoose from 'mongoose';

// Existing validation for creating appointments
export const validateAppointment = (req, res, next) => {
    const {
        firstName,
        lastName,
        gender,
        email,
        contactNumber,
        reason,
        selectedDate,
        selectedTime
    } = req.body;

    // Validate required fields
    if (!firstName || firstName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'First name is required and must be at least 2 characters long'
        });
    }

    if (!lastName || lastName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Last name is required and must be at least 2 characters long'
        });
    }

    if (!gender || !['male', 'female', 'other', 'prefer-not-to-say'].includes(gender)) {
        return res.status(400).json({
            success: false,
            message: 'Please select a valid gender'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid email address'
        });
    }

    // Validate contact number (assuming 11-digit Philippine number)
    const contactRegex = /^[0-9]{11}$/;
    if (!contactNumber || !contactRegex.test(contactNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid 11-digit contact number'
        });
    }

    if (!reason || reason.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: 'Reason for appointment is required and must be at least 5 characters long'
        });
    }

    if (!selectedDate) {
        return res.status(400).json({
            success: false,
            message: 'Please select a date for your appointment'
        });
    }

    if (!selectedTime) {
        return res.status(400).json({
            success: false,
            message: 'Please select a time for your appointment'
        });
    }

    // Validate date is not in the past
    const appointmentDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
        return res.status(400).json({
            success: false,
            message: 'Cannot schedule appointments in the past'
        });
    }

    // Validate it's not a weekend (0 = Sunday, 6 = Saturday)
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({
            success: false,
            message: 'Appointments are only available on weekdays (Monday to Friday)'
        });
    }

    // Validate time format (assuming 24-hour format like "09:00" or "14:30")
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(selectedTime)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid time in HH:MM format'
        });
    }

    // Validate business hours (8 AM to 5 PM)
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const startTime = 8 * 60; // 8:00 AM
    const endTime = 17 * 60; // 5:00 PM

    if (timeInMinutes < startTime || timeInMinutes >= endTime) {
        return res.status(400).json({
            success: false,
            message: 'Appointments are only available between 8:00 AM and 5:00 PM'
        });
    }

    next();
};

// New validation for updating appointments
export const validateAppointmentUpdate = (req, res, next) => {
    const { selectedDate, selectedTime, reason } = req.body;
    const { appointmentId } = req.params;

    // Validate appointment ID
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid appointment ID'
        });
    }

    // Validate required fields for update
    if (!selectedDate || !selectedTime || !reason) {
        return res.status(400).json({
            success: false,
            message: 'Date, time, and reason are required for appointment update'
        });
    }

    if (reason.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: 'Reason must be at least 5 characters long'
        });
    }

    // Validate date is not in the past
    const appointmentDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
        return res.status(400).json({
            success: false,
            message: 'Cannot schedule appointments in the past'
        });
    }

    // Validate it's not a weekend
    const dayOfWeek = appointmentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({
            success: false,
            message: 'Appointments are only available on weekdays (Monday to Friday)'
        });
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(selectedTime)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid time in HH:MM format'
        });
    }

    // Validate business hours (8 AM to 5 PM)
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const startTime = 8 * 60; // 8:00 AM
    const endTime = 17 * 60; // 5:00 PM

    if (timeInMinutes < startTime || timeInMinutes >= endTime) {
        return res.status(400).json({
            success: false,
            message: 'Appointments are only available between 8:00 AM and 5:00 PM'
        });
    }

    // Validate that appointment time is at least 30 minutes from now if today
    if (appointmentDate.toDateString() === today.toDateString()) {
        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        
        if (timeInMinutes <= currentTimeInMinutes + 30) {
            return res.status(400).json({
                success: false,
                message: 'Appointments must be scheduled at least 30 minutes in advance'
            });
        }
    }

    next();
};

// Validation for status updates (admin)
export const validateStatusUpdate = (req, res, next) => {
    const { status } = req.body;
    const { appointmentId } = req.params;

    // Validate appointment ID
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid appointment ID'
        });
    }

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Status must be one of: ${validStatuses.join(', ')}`
        });
    }

    next();
};

// Middleware to check if user can modify appointment
export const checkAppointmentOwnership = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // This will be used in the controller to verify ownership
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};