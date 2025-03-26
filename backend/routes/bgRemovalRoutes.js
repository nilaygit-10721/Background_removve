import express from "express";
import { removeBackground } from "../controllers/bgRemovalController.js";
import { upload } from "../controllers/imageUploadController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Single endpoint that handles both upload and processing
router.post("/bg-removal", auth, upload.single("image"), removeBackground);

export default router;
