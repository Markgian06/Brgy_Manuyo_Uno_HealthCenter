import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    appointmentNumber: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        default: null // Allow null for backwards compatibility
    },
    firstName: {
        type: String,
        required: true,
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
    doctorName: {
        type: String,
        default: '' // Optional field for doctor assignment
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

// Index for better query performance
appointmentSchema.index({ userId: 1, createdAt: -1 });
appointmentSchema.index({ email: 1, createdAt: -1 });
appointmentSchema.index({ selectedDate: 1, selectedTime: 1 });

export default mongoose.model('Appointment', appointmentSchema);