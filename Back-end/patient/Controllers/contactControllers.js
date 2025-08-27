import Contact from "../Models/contactModel.js";

export const createContact = async (req, res) => {
  try {
    const { name, contactus, message } = req.body;

    const newContact = await Contact.create({ name, contactus, message });
    res.status(201).json({ success: true, data: newContact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contactus = await Contact.find();
    res.json({ success: true, data: contactus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



