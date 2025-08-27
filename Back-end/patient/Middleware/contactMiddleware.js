export const validateContact = (req, res, next) => {

  const { name, contacts, message } = req.body;
  if (!name || !contacts || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  next();
};