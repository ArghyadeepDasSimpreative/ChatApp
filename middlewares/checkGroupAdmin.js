import { errorHandler } from "../lib/error.js";
import ChatRoom from "../models/chatroom.model.js";

const checkGroupAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const room = await ChatRoom.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    const isAdmin = room.admins.some(adminId => adminId.toString() === userId);
    if (!isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.chatRoom = room; // Pass to controller if needed
    next();
  } catch (err) {
    errorHandler(err, req, res);
  }
};

export default checkGroupAdmin;
