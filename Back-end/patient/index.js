import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import functionRouter from './Routes/functionRoutes.js';
import dbConnection from './Controllers/dbConnection.js';
import contactRoutes from './Routes/contactRoutes.js';
import appointmentRoutes from './Routes/appointmentRoutes.js';
import path from 'path';


const app = express();
const port = process.env.PORT || 5000;


app.use(express.urlencoded({ extended: true }));
app.use(cors({credentials: true}));
app.use(express.urlencoded({ extended: true }));    
app.use('/frontend', express.static('frontend'));
app.use('/Back-end', express.static('Back-end'));

app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(functionRouter);


app.get('/', (req, res) => {
    res.sendFile(path.resolve('./index.html'));
});


app.get('/', (req, res) => res.send('API WORKING'));
app.use('/api/auth', functionRouter);


app.use("/api", contactRoutes);
app.use('/api', appointmentRoutes);



app.listen(port, () => {
    dbConnection();
    console.log(`Listening on port ${port}`);
});   