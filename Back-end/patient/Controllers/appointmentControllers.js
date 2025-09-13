import Appointment from '../Models/appointmentModels.js';

// Create appointment (existing functionality enhanced)
export const createAppointment = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body); 

    const {
      firstName,
      lastName,
      middleName,
      gender,
      email,
      contactNumber,
      reason,
      selectedDate,
      selectedTime,
      appointmentNumber
    } = req.body;

    // Check for existing appointment at the same time slot
    const existingAppointment = await Appointment.findOne({
      selectedDate: selectedDate,
      selectedTime: selectedTime
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select a different time.'
      });
    }

    // Get user ID from session/token if available
    let userId = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
    }

    const appointment = new Appointment({
      firstName,
      lastName,
      middleName,
      gender,
      email,
      contactNumber,
      reason,
      selectedDate,
      selectedTime,
      appointmentNumber,
      userId: userId // Link to user if authenticated
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      data: appointment
    });
  } catch (error) {
    console.error("Error creating appointment:", error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get appointments for authenticated user
export const getUserAppointments = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email; // Assuming email is in user session

    // Find appointments by userId OR by email (for backward compatibility)
    const appointments = await Appointment.find({
      $or: [
        { userId: userId },
        { email: userEmail }
      ]
    }).sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.status(200).json({
      success: true,
      appointments: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error("Error fetching user appointments:", error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get all appointments (for admin/staff)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      appointments: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error("Error fetching all appointments:", error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Get appointments by date and time (existing functionality)
export const getAppointmentsByDateTime = async (req, res) => {
  try {
    const { selectedDate, selectedTime } = req.params;
    
    const appointments = await Appointment.find({
      selectedDate: selectedDate,
      selectedTime: selectedTime
    });

    res.status(200).json({
      success: true,
      appointments: appointments
    });
    
  } catch (error) {
    console.error("Error fetching appointments:", error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        status: status,
        notes: notes || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error("Error updating appointment:", error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};