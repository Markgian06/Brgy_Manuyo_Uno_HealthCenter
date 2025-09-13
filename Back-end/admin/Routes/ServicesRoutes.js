import express from "express";
import upload from "../Middleware/ServicesUpload.js"; 
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleFavorite,
} from "../Controller/ServicesController.js";

const router = express.Router();
router.post("/", upload.single("image"), createPost);

router.get("/", getPosts);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.patch("/:id/favorite", toggleFavorite);

export default router;
