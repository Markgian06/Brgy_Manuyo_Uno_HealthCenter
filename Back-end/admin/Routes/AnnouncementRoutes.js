import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../Controller/AnnouncementController.js";

const router = express.Router();

router.route("/")
  .get(getAnnouncements)
  .post(createAnnouncement);

router.route("/:id")
  .put(updateAnnouncement)
  .delete(deleteAnnouncement);

export default router;
