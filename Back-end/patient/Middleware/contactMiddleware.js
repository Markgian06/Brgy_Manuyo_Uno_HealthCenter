export const validateContact = (req, res, next) => {
  const { name, contact, message } = req.body;
  if (!name || !contact || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  next();
};