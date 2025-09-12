import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import functionRouter from './patient/Routes/functionRoutes.js';
import dbConnection from './patient/Controllers/dbConnection.js';
import contactRoutes from './patient/routes/contactRoutes.js';
import appointmentRoutes from './patient/routes/appointmentRoutes.js';
import userRouter from './patient/routes/userRoute.js';
import path from 'path';

import { fileURLToPath } from "url";
import userToken from "./patient/Middleware/userToken.js";

//admin
import announcementRoutes from "./admin/Routes/AnnouncementRoutes.js";
import postRoutes from "./admin/Routes/ServicesRoutes.js";
const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(express.urlencoded({ extended: true }));
app.use(cors({credentials: true}));
app.use(express.urlencoded({ extended: true }));    


app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/frontend/patient/html/appointment.html", userToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/patient/html/appointment.html"));
});

// Protect profile.html
app.get("/frontend/patient/html/profile.html", userToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/patient/html/profile.html"));
});

app.get("/frontend/patient/html/updateGmail.html", userToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/patient/html/updateGmail.html"));
});

app.use('/frontend', express.static('frontend'));
app.use('/Back-end', express.static('Back-end'));
app.use(functionRouter);
app.use(userRouter);


app.get('/', (req, res) => {
    res.sendFile(path.resolve('./index.html'));
});


app.get('/', (req, res) => res.send('API WORKING'));
app.use('/api/auth', functionRouter);
app.use('/api/auth', userRouter);



app.use("/api", contactRoutes);
app.use('/api', appointmentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/posts", postRoutes);

app.listen(port, () => {
    dbConnection();
    console.log(`Listening on port ${port}`);
});   