import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contacts: { type: String, required: true },
  message: { type: String, required: true },
}, { 
  collections: 'contacts',
  timestamps: true
 });

export default mongoose.model("Contact", contactSchema);