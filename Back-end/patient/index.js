import 'dotenv/config';
import express from "express";
import cors from "cors";
import dbConnection from './Controllers/dbConnection.js';

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({credentials: true}));
app.use(express.json());

app.listen(port, () => {
    dbConnection();
    console.log(`Listening on port ${port}`);
});