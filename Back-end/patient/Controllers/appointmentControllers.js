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


export const getAppointmentById = async (req, res) => {
  try {
      const { appointmentId } = req.params;

      if (!req.user || !req.user.id) {
          return res.status(401).json({
              success: false,
              message: 'Authentication required'
          });
      }

      const appointment = await Appointment.findOne({
          _id: appointmentId,
          userId: req.user.id
      });

      if (!appointment) {
          return res.status(404).json({
              success: false,
              message: 'Appointment not found'
          });
      }

      res.json({
          success: true,
          appointment
      });

  } catch (error) {
      console.error('Get appointment by ID error:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch appointment details',
          error: error.message
      });
  }
};

// Update Appointment (new)
export const updateAppointment = async (req, res) => {
  try {
      const { appointmentId } = req.params;
      const { selectedDate, selectedTime, reason } = req.body;

      if (!req.user || !req.user.id) {
          return res.status(401).json({
              success: false,
              message: 'Authentication required'
          });
      }

      // Find the appointment
      const appointment = await Appointment.findOne({
          _id: appointmentId,
          userId: req.user.id
      });

      if (!appointment) {
          return res.status(404).json({
              success: false,
              message: 'Appointment not found'
          });
      }

      // Check if appointment can be edited
      const now = new Date();
      const appointmentDateTime = new Date(appointment.selectedDate + ' ' + appointment.selectedTime);
      const status = appointment.status || 'PENDING';

      if (appointmentDateTime <= now) {
          return res.status(400).json({
              success: false,
              message: 'Cannot edit past appointments'
          });
      }

      if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(status.toUpperCase())) {
          return res.status(400).json({
              success: false,
              message: `Cannot edit ${status.toLowerCase()} appointments`
          });
      }

      // Check if new time slot is available (if date/time changed)
      if (selectedDate !== appointment.selectedDate.toISOString().split('T')[0] || 
          selectedTime !== appointment.selectedTime) {
          
          const conflictingAppointment = await Appointment.findOne({
              selectedDate,
              selectedTime,
              _id: { $ne: appointmentId },
              status: { $nin: ['CANCELLED', 'REJECTED'] }
          });

          if (conflictingAppointment) {
              return res.status(409).json({
                  success: false,
                  message: 'The selected time slot is already booked. Please choose another time.'
              });
          }
      }

      // Validate date is not in the past and not weekend
      const newDate = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newDate < today) {
          return res.status(400).json({
              success: false,
              message: 'Cannot schedule appointments in the past'
          });
      }

      const dayOfWeek = newDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
          return res.status(400).json({
              success: false,
              message: 'Appointments are only available on weekdays'
          });
      }

      // Update the appointment
      appointment.selectedDate = selectedDate;
      appointment.selectedTime = selectedTime;
      appointment.reason = reason;
      appointment.updatedAt = new Date();

      await appointment.save();

      res.json({
          success: true,
          message: 'Appointment updated successfully',
          appointment
      });

  } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to update appointment',
          error: error.message
      });
  }
};

// Delete Appointment (new)
export const deleteAppointment = async (req, res) => {
  try {
      const { appointmentId } = req.params;

      if (!req.user || !req.user.id) {
          return res.status(401).json({
              success: false,
              message: 'Authentication required'
          });
      }

      const appointment = await Appointment.findOne({
          _id: appointmentId,
          userId: req.user.id
      });

      if (!appointment) {
          return res.status(404).json({
              success: false,
              message: 'Appointment not found'
          });
      }

      // Check if appointment can be deleted
      const status = appointment.status || 'PENDING';

      if (status.toUpperCase() === 'COMPLETED') {
          return res.status(400).json({
              success: false,
              message: 'Cannot delete completed appointments'
          });
      }

      // Delete the appointment
      await Appointment.findByIdAndDelete(appointmentId);

      res.json({
          success: true,
          message: 'Appointment deleted successfully'
      });

  } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({
          success: false,
          message: 'Failed to delete appointment',
          error: error.message
      });
  }
};