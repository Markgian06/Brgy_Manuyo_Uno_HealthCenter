import express from "express";
import { createContact } from "../Controllers/contactControllers.js";
import { validateContact } from "../Middleware/contactMiddleware.js";

const router = express.Router();

router.post("/contacts", validateContact, createContact);


export default router;