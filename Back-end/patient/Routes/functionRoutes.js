import express from 'express';
import multer from 'multer';
import { signup, signin } from '../Controllers/functionController.js';
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
            }
        }
        if (err) {
            return next(err);
        }
        next();
    });
}, signup);

functionRouter.post('/signin', signin);


export default functionRouter;