import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userRole:{type: String, required: true},
    patientID: { type: Number, required: true, unique: true },
    ID_image: [{type: String, required: true}],
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    birthDate: {type: Date, required: true},
    age: {type: String, required: true},
    gender: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    contactNum: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    verifyOTP: {type: String, default: ''},
    verifyOTPExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOTP: {type: String, default: ''},
    resetOTPExpireAt: {type: Number, default: 0},
    pendingNewEmail: { type: String, default: "" },
    
},{
    collection: 'SignUp'
});

const signUpModels = mongoose.models.user || mongoose.model('user', userSchema);

export default signUpModels;