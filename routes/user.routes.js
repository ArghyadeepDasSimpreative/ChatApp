import express from "express";
import { loginUser, registerUser } from "../controllers/user.controllers.js";

const authRoutes = express.Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);

export default authRoutes;