import express from "express";
import { authorizeRole } from "../middlewares/authorize.js";
import { uploadSingleFile } from "../middlewares/fileupload.js";
import { addAdminToChatRoom, addMembersToChatRoom, changePrivacyStatus, createChatRoom, removeMemberFromChatRoom, updateChatRoomAvatar, updateChatRoomInfo, handlePrivateChat, handleGroupChat, sendMessage } from "../controllers/chatroom.controllers.js";
import checkGroupAdmin from "../middlewares/checkGroupAdmin.js";

const chatRoomRoutes = express.Router();

chatRoomRoutes.post("/", authorizeRole("user"), uploadSingleFile("image"), createChatRoom);
chatRoomRoutes.post("/:id/members", authorizeRole("user"), addMembersToChatRoom);
chatRoomRoutes.delete("/:id/members/:memberId", authorizeRole("user"), removeMemberFromChatRoom);
chatRoomRoutes.post("/:id/image", authorizeRole("user"), uploadSingleFile("image"),updateChatRoomAvatar);
chatRoomRoutes.post("/:id/admin", authorizeRole("user"), checkGroupAdmin , addAdminToChatRoom);
chatRoomRoutes.put("/:id", authorizeRole("user"), checkGroupAdmin, updateChatRoomInfo);
chatRoomRoutes.put("/:id/privacy", authorizeRole("user"), checkGroupAdmin, changePrivacyStatus);
chatRoomRoutes.post("/one-to-one-chat", authorizeRole("user"), handlePrivateChat);
chatRoomRoutes.post("/group-chat", authorizeRole("user"), handleGroupChat);
chatRoomRoutes.post("/send-message", authorizeRole("user"),sendMessage)

export default chatRoomRoutes;