import express from "express";
import { authorizeRole } from "../middlewares/authorize.js";
import { uploadSingleFile } from "../middlewares/fileupload.js";
import { addMembersToChatRoom, createChatRoom } from "../controllers/chatroom.controllers.js";

const chatRoomRoutes = express.Router();

chatRoomRoutes.post("/", authorizeRole("user"), uploadSingleFile("image"), createChatRoom);
chatRoomRoutes.post("/:id/add-members", authorizeRole("user"), addMembersToChatRoom);

export default chatRoomRoutes;