import Contact from "../Models/contactModel.js";

export const createContact = async (req, res) => {

//  console.log(req.body);

try {
    const { name, contacts, message } = req.body;

    const newContact = Contact.create({ name, contacts, message });
    res.status(201).json({ success: true, data: newContact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contact = await Contact.find();
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

