import express from "express";
import { createAppointment } from "../Controllers/appointmentControllers.js";
import { validateAppointment } from "../Middleware/appointmentMiddleware.js";
import { getAppointmentsByDate } from "../Controllers/getAppointmentsByDate.js";

const router = express.Router();

router.get("/appointments", getAppointmentsByDate);
router.post("/appointments", validateAppointment, createAppointment);


export default router;