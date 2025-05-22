import ChatRoom from "../models/chatroom.model.js";
import { errorHandler } from "../lib/error.js";

export const createChatRoom = async (req, res) => {
  try {
    const { name, description, members = [], type = "private", tags = [] } = req.body;
    console.log(req.user)
    if (!name) return res.status(400).json({ message: "Room name is required" });

    const userId = req.user.id;

    const uniqueMembers = [...new Set([...members, userId])];

    const newRoom = new ChatRoom({
      name,
      description,
      avatar: req.file?.filename || null,
      members: uniqueMembers,
      createdBy: userId,
      admins: [userId],
      type,
      isGroup: true,
      tags,
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({ message: "Chat room created", room: savedRoom });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

export const addMembersToChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { members = [] } = req.body;
    const userId = req.user.id;

    if (!members.length) {
      return res.status(400).json({ message: "No members provided" });
    }

    const room = await ChatRoom.findById(id);
    if (!room) return res.status(404).json({ message: "Chat room not found" });

    const isAdmin = room.admins.some(adminId => adminId.toString() === userId);
    if (!isAdmin) return res.status(403).json({ message: "Access denied. Admins only." });

    const updatedMembers = [...new Set([...room.members.map(id => id.toString()), ...members])];

    room.members = updatedMembers;
    await room.save();

    res.status(200).json({ message: "Members added successfully", room });
  } catch (err) {
    errorHandler(err, req, res);
  }
};
