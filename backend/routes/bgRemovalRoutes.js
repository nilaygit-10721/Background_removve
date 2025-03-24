import express from "express";
import { removeBackground } from "../controllers/bgRemovalController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.post("/", auth, removeBackground);

export default router;
