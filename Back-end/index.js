import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import functionRouter from './patient/Routes/functionRoutes.js';
import dbConnection from './patient/Controllers/dbConnection.js';
import contactRoutes from './patient/Routes/contactRoutes.js';
import appointmentRoutes from './patient/Routes/appointmentRoutes.js';


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







// Checking if your are login 
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.redirect("/frontend/patient/html/login.html");
  }

  jwt.verify(token, "my-secret-key", (err, user) => {
    if (err) {
      return res.redirect("/frontend/patient/html/login.html");
    }
    req.user = user;
    next();
  });
}

// Protected route 
app.get("/frontend/patient/html/appointment.html", authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/patient/html", "appointment.html"));
});