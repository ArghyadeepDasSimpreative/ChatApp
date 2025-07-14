import express from "express";
import { authorizeRole } from "../middlewares/authorize.js";
import { getUsersList, updateProfile } from "../controllers/user.controllers.js";
import {upload} from "../upload.js"

const userRoutes = express.Router();

userRoutes.put("/",upload.single('file'), authorizeRole(["user"]), updateProfile);
userRoutes.get("/", authorizeRole(["user"]), getUsersList);

export default userRoutes;