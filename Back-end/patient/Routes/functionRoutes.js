import express from 'express';
import multer from 'multer';
import { signup, signin, logout, sendVerifyOtp, verifyEmail,
     isAuthenticated, sendResetOtp, resetPassword, logged, updateGmail, sendUpdateGmailOtp } 
from '../Controllers/functionController.js';
import uploads from '../Middleware/uploads.js';
import userToken from '../Middleware/userToken.js';

const functionRouter = express.Router();

functionRouter.post('/signup', (req, res, next) => {

    uploads.array('ID_image', 2)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Only 2 photos need to be uploaded'
                });
            }else if (err.code === 'LIMIT_FILE_SIZE') { 
                return res.status(400).json({
                    success: false,
                    message: 'File size limit exceeded. Each file must be less than 5MB.'
                });
            }
        }
        
        if (err) {
            return next(err);
        }

        if (!req.files || req.files.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Exactly 2 valid ID pictures are required.'
            });
        }
        
        next();
    });
}, signup);

functionRouter.post('/signin', signin);
functionRouter.post('/logout', logout);
functionRouter.post('/sendVerifyOtp', userToken, sendVerifyOtp);
functionRouter.post('/verifyEmail', userToken, verifyEmail);
functionRouter.post('/is-auth', userToken, isAuthenticated);
functionRouter.post('/sendResetOtp', sendResetOtp);
functionRouter.post('/resetPassword', resetPassword);
functionRouter.post("/is-logged", logged);
functionRouter.post("/updateGmail", userToken, updateGmail);
functionRouter.post("/sendUpdateGmailOtp", userToken, sendUpdateGmailOtp);


export default functionRouter;