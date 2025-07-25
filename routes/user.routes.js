import express from "express";
import { authorizeRole } from "../middlewares/authorize.js";
import { getUsersList, updateProfile, getUsers } from "../controllers/user.controllers.js";
import {upload} from "../upload.js"

const userRoutes = express.Router();

userRoutes.post("/",upload.single('file'), authorizeRole(["user"]), updateProfile);
userRoutes.get("/", authorizeRole(["user"]), getUsersList);
userRoutes.get("/:id", authorizeRole(["user"]), getUsers);

export default userRoutes;