import signUpModels from "../DatabaseModel/signUpSchema.js";
import { getNextSequenceValue } from "../Middleware/incrementID.js";
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from "./nodemailer.js";

const sendErrorResponse = (res, status, message) => {
    return res.status(status).json({ success: false, message });
};



export const signup = async (req, res) => {

    const validationRules = [
        body('firstName').notEmpty().withMessage('First name is required').isString(),
        body('lastName').notEmpty().withMessage('Last name is required').isString(),
        body('birthDate').notEmpty().withMessage('Date of birth is required').isISO8601(),
        body('age').notEmpty().withMessage('Age is required').isInt({ min: 8 }).withMessage('Age must be at least 8 years old'),
        body('gender').notEmpty().withMessage('Gender is required').isString().withMessage('Select Gender'),
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        body('contactNum')
            .notEmpty().withMessage('Contact Number is required')
            .isString().withMessage('Contact number must be a string')
            .isLength({ min: 11, max: 11 }).withMessage('Enter a valid phone number'),
        body('password').notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/[0-9]/).withMessage('Password must contain at least one number')
            .matches(/[!@#$%^&*()\-+_=<>?]/).withMessage('Password must contain at least one special character')
    ];


    await Promise.all(validationRules.map(rule => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array()[0].msg); 
    }

   const {firstName, lastName, birthDate, age, gender, email, contactNum, password } = req.body;

   if (!req.files || req.files.length === 0) {
    return sendErrorResponse(res, 400, 'Valid ID picture is required.');
}
    try {

        const existingUser = await signUpModels.findOne({email});

        if(existingUser){
            return res.json({success: false, message: 'User already exists'})
        }

        const userFolder = path.join('PatientFileUploads', email);
        await fs.promises.mkdir(userFolder, { recursive: true });

        const imageUrls = [];
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const fileName = `ID_${i + 1}_${Date.now()}${path.extname(file.originalname)}`;
            const filePath = path.join(userFolder, fileName);
            
            await fs.promises.writeFile(filePath, file.buffer);
            
            const imageUrl = `http://localhost:5000/PatientFileUploads/${email}/${fileName}`;
            imageUrls.push(imageUrl);
        }

        const nextId = await getNextSequenceValue('patientID');

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new signUpModels({userRole: 'user', patientID: nextId, ID_image: imageUrls, firstName, lastName, birthDate, age, gender, email, 
            contactNum, password: hashedPassword});
            await user.save();

            const token = jwt.sign({id: user.id},process.env.JWT_SECRET, {expiresIn: '7d'});

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 1000
            });
        
            return res.status(201).json({success: true, message: "Successfully Registered"});
    } 
    catch(error){
        console.error("Registration error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }

}



export const signin = async (req, res) => {
    const validationRules = [

        body('loginIdentifier')
            .notEmpty().withMessage('Email or Contact Number is required')
            .custom(value => {
                const isEmail = value.includes('@');
                const isPhoneNumber = /^\d+$/.test(value);

                if (!isEmail && !isPhoneNumber) {
                    throw new Error('Invalid email or contact number format');
                }
                return true;
            }),
        body('password').notEmpty().withMessage('Password is required'),
    ];

    await Promise.all(validationRules.map(rule => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array()[0].msg);
    }

    const { loginIdentifier, password } = req.body;

    try {
        const isEmail = loginIdentifier.includes('@');
        let user;

        if (isEmail) {
            user = await signUpModels.findOne({ email: loginIdentifier });
        } else {
            user = await signUpModels.findOne({ contactNum: loginIdentifier });
        }

        if (!user) {
            return sendErrorResponse(res, 401, 'Invalid Email or Contact Number');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return sendErrorResponse(res, 401, 'Invalid Password');
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 1000
        });

        return res.json({ success: true, message: "Successfully Login" });

    } catch (error) {
        console.error("Login error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};



export const logout = async (req, res) => {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.json({success: true, message: 'Logged Out'})

    }
    catch(error){
        console.error("Logout error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};



export const sendVerifyOtp = async (req, res) =>{

    const validationRules = [
        body('userId').notEmpty().withMessage('User ID is required').isString(),
    ];

    await Promise.all(validationRules.map(rule => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array()[0].msg);
    }

    try{
        const {userId} = req.body;

        const user = await signUpModels.findById(userId);

        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        if(user.isAccountVerified){
            return sendErrorResponse(res, 400, 'Account is Already verified');
        }

        const otp = String(Math.floor( 100000 + Math.random() * 900000));   

        user.verifyOTP = otp;
        user.verifyOTPExpireAt = Date.now() + 2 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "MANUYO UNO HEALTH CENTER, Account Verification OTP",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Account Verification OTP</h2>
                <p>Your OTP to verify your account is:</p>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                </div>
                <p>Use this OTP to complete your account verification.</p>
                <p style="color: #e74c3c;"><strong>This OTP expires in 2 minutes.</strong></p>
                <p>If you didn't create an account, please ignore this email.</p>
            </div>
        `
        }
        await transporter.sendMail(mailOption);

        res.json({success: true, message: 'Verification OTP sent on Email'});
    }
    catch(error){
        console.error("Send OTP error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};



export const verifyEmail = async (req, res) =>{

    const validationRules = [
        body('userId').notEmpty().withMessage('User ID is required').isString(),
        body('otp').notEmpty().withMessage('OTP is required').isString(),
    ];

    await Promise.all(validationRules.map(rule => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array()[0].msg);
    };

    const {userId, otp} = req.body;

    try{
        const user = await signUpModels.findById(userId);

        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        };

        if(user.verifyOTP === '' || user.verifyOTP !== otp){
            return sendErrorResponse(res, 400, 'Invalid OTP');
        }

        if(user.verifyOTPExpireAt < Date.now()){
            return sendErrorResponse(res, 400, 'OTP Expired');   
        }

        user.isAccountVerified = true;
        user.verifyOTP = '';
        user.verifyOTPExpireAt = undefined;

        await user.save();
        
        return res.json({success: true, message: 'Email Verified Successfully'});
    }
    catch(error){
        console.error("Verify Email error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};



export const isAuthenticated = async (req, res) => {

    const validationRules = [
        body('userId').notEmpty().withMessage('User ID is required').isString(),
    ];

    await Promise.all(validationRules.map(rule => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array()[0].msg);
    }

    const { userId } = req.body; 

    try {
        const user = await signUpModels.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.isAccountVerified) { 
            return res.status(401).json({ success: false, message: 'Account not verified' });
        }

        return res.json({ success: true, message: 'Account is authenticated' });

    } catch (error) {
        console.error("Is Authenticated error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};



export const sendResetOtp = async (req, res) => {
    const validationRules = [
        // Updated to accept 'identifier' which can be email or contact number
        body('identifier')
            .notEmpty().withMessage('Email or Contact Number is required')
            .custom(value => {
                const isEmail = value.includes('@');
                const isPhoneNumber = /^\d+$/.test(value);
                if (!isEmail && !isPhoneNumber) {
                    throw new Error('Invalid email or contact number format');
                }
                return true;
            }),
    ];

    await Promise.all(validationRules.map(rule => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, errors.array()[0].msg);
    }

    const { identifier } = req.body;

    try {
        // Determine if identifier is email or phone number
        const isEmail = identifier.includes('@');
        let user;

        if (isEmail) {
            user = await signUpModels.findOne({ email: identifier });
        } else {
            user = await signUpModels.findOne({ contactNum: identifier });
        }

        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOTP = otp;
        user.resetOTPExpireAt = Date.now() + 2 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email, // Always send to user's email regardless of identifier type
            subject: "MANUYO UNO HEALTH CENTER ACCOUNT, Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Password Reset OTP</h2>
                    <p>Your OTP for resetting your password is:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>Use this OTP to proceed with resetting your password.</p>
                    <p style="color: #e74c3c;"><strong>This OTP expires in 2 minutes.</strong></p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOption);

        res.json({ success: true, message: "OTP sent to your email" });

    } catch (error) {
        console.error("Send Reset OTP error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};


export const resetPassword = async (req, res) =>{
    const validationRules = [
        // Updated to accept 'identifier' which can be email or contact number
        body('identifier')
            .notEmpty().withMessage('Email or Contact Number is required')
            .custom(value => {
                const isEmail = value.includes('@');
                const isPhoneNumber = /^\d+$/.test(value);
                if (!isEmail && !isPhoneNumber) {
                    throw new Error('Invalid email or contact number format');
                }
                return true;
            }),
        body('otp').notEmpty().withMessage('OTP is required').isString(),
        body('newPassword')
            .notEmpty().withMessage('New Password is required')
            .isLength({min: 8}).withMessage('Password must be at least 8 characters long')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/[!@#$%^&*()\-+_=<>?]/).withMessage('Password must contain at least one special character'),
        // Added a new field for confirm password to avoid logical error
        body('confirmNewPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Confirm new password does not match new password');
                }
                return true;
            }),
    ];

    await Promise.all(validationRules.map(rule => rule.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return sendErrorResponse(res, 400, errors.array()[0].msg);
    }

    // Now using 'identifier' which can be email or phone number
    const {identifier, otp, newPassword} = req.body;

    try {
        const isEmail = identifier.includes('@');
        let user;

        if (isEmail) {
            user = await signUpModels.findOne({email: identifier});
        } else {
            user = await signUpModels.findOne({contactNum: identifier});
        }

        if (!user) {
            return sendErrorResponse(res, 404, 'User not found');
        }

        if (user.resetOTP === "" || user.resetOTP !== otp) {
            return sendErrorResponse(res, 400, 'Invalid OTP');
        }

        if (user.resetOTPExpireAt < Date.now()) {
            return sendErrorResponse(res, 400, 'OTP Expired');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOTP = '';
        user.resetOTPExpireAt = 0;

        await user.save();

        return res.json({success: true, message: "Password has been reset successfully"});
    } catch (error) {
        console.error("Reset Password error:", error);
        return sendErrorResponse(res, 500, 'Internal server error');
    }
};
