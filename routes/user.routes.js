import express from "express";
import { authorizeRole } from "../middlewares/authorize.js";
import { getUsersList, updateProfile } from "../controllers/user.controllers.js";

const userRoutes = express.Router();

userRoutes.put("/", authorizeRole(["user"]), updateProfile);
userRoutes.get("/", authorizeRole(["user"]), getUsersList);

export default userRoutes;