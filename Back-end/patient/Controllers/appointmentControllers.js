import Appointment from '../Models/appointmentModels.js';
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
      appointmentNumber
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
