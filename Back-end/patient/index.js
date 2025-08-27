import 'dotenv/config';
import express from "express";
import cors from "cors";
import dbConnection from './Controllers/dbConnection.js';
import contactRoutes from './Routes/contactRoutes.js';


const app = express();
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));


app.use(cors({ credentials: true }));
app.use(express.json());


app.use("/api/contact", contactRoutes);

app.listen(port, () => {
    dbConnection();
    console.log(`Listening on port ${port}`);
});   