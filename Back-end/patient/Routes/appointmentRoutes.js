import express from "express";
import { createAppointment } from "../Controllers/appointmentControllers.js";
import { validateAppointment } from "../Middleware/appointmentMiddleware.js";

const router = express.Router();

router.post("/appointments", validateAppointment, createAppointment);


export default router;