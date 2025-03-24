import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUserActivity,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", auth, getUserProfile);
router.get("/activity", auth, getUserActivity);

export default router;
