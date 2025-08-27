import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);