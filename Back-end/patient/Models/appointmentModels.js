import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    appointmentNumber: {
        type: String,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
        default: ''
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"], 
      required: true
    },
    email: {
        type: String,
        required: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    contactNumber: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    selectedDate: {
        type: Date,
        required: true
    },
    selectedTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});


export default mongoose.model('Appointment', appointmentSchema);