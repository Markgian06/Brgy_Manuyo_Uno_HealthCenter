export const validateAppointment = (req, res, next) => {
  const {
    firstName,
    lastName,
    middleName, 
    gender,
    email,
    contactNumber,
    reason,
    selectedDate,
    selectedTime
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !gender ||
    !email ||
    !contactNumber ||
    !reason ||
    !selectedDate ||
    !selectedTime
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled"
    });
  }

  next();
};
