import signUpModels from "../DatabaseModel/signUpSchema.js";
import { getNextSequenceValue } from "../Middleware/incrementID.js";
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
        body('contactNum').notEmpty().withMessage('Contact Number is required').isInt({min: 11}).withMessage('Enter a valid phone number'),
        body('password').notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*()\-+_=<>?]/).withMessage('Password must contain at least one special character')
        ]

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
        const user = new signUpModels({patientID: nextId, ID_image: imageUrls, firstName, lastName, birthDate, age, gender, email, 
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