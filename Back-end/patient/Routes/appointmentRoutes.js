import express from "express";
import { 
    createAppointment, 
    getUserAppointments, 
    getAllAppointments,
    getAppointmentsByDateTime,
    updateAppointmentStatus,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
} from "../Controllers/appointmentControllers.js";
import { validateAppointment, validateAppointmentUpdate } from "../Middleware/appointmentMiddleware.js";
import { authenticateAPI, optionalAPIAuth } from "../Controllers/userData.js";

const router = express.Router();

// Public routes
router.get("/appointments/:selectedDate/:selectedTime", getAppointmentsByDateTime);

// Routes that can work with or without authentication
router.post("/appointments", optionalAPIAuth, validateAppointment, createAppointment);

// Protected routes (require authentication)
router.get("/patient/appointments", authenticateAPI, getUserAppointments);
router.get("/patient/appointments/:appointmentId", authenticateAPI, getAppointmentById);
router.put("/patient/appointments/:appointmentId", authenticateAPI, validateAppointmentUpdate, updateAppointment);
router.delete("/patient/appointments/:appointmentId", authenticateAPI, deleteAppointment);

// Admin routes
router.get("/admin/appointments", authenticateAPI, getAllAppointments);
router.patch("/admin/appointments/:appointmentId/status", authenticateAPI, updateAppointmentStatus);

export default router;