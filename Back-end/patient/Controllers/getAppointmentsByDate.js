
export const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const existingAppointments = await Appointment.find({
      selectedDate: date
    }).select('selectedTime appointmentNumber firstName lastName'); 
    
    res.json({
      success: true,
      appointments: existingAppointments,
      count: existingAppointments.length
    });
    
  } catch (error) {
    console.error('Error checking appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while checking appointments'
    });
  }
};