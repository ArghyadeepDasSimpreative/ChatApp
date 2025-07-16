import ChatRoom from "../models/chatroom.model.js";
import { errorHandler } from "../lib/error.js";
import { findOrCreatePrivateRoom, createGroupChat } from "../common.js";

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

export const removeMemberFromChatRoom = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const userId = req.user.id;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    const room = await ChatRoom.findById(id);
    if (!room) return res.status(404).json({ message: "Chat room not found" });

    const isAdmin = room.admins.some(adminId => adminId.toString() === userId);
    if (!isAdmin) return res.status(403).json({ message: "Access denied. Admins only." });

    if (!room.members.some(m => m.toString() === memberId)) {
      return res.status(404).json({ message: "Member not found in this chat room" });
    }

    room.members = room.members.filter(m => m.toString() !== memberId);

    room.admins = room.admins.filter(a => a.toString() !== memberId);

    await room.save();

    res.status(200).json({ message: "Member removed successfully", room });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

export const updateChatRoomAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    const room = await ChatRoom.findById(id);
    if (!room) return res.status(404).json({ message: "Chat room not found" });

    const isAdmin = room.admins.some(adminId => adminId.toString() === userId);
    if (!isAdmin) return res.status(403).json({ message: "Access denied. Admins only." });

    room.avatar = req.file.filename;

    await room.save();

    res.status(200).json({ message: "Chat room avatar updated", room });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

export const addAdminToChatRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { newAdminId } = req.body;
    const userId = req.user.id;

    if (!newAdminId) {
      return res.status(400).json({ message: "newAdminId is required" });
    }

    const room = await ChatRoom.findById(id);
    if (!room) return res.status(404).json({ message: "Chat room not found" });

    const isAdmin = room.admins.some(adminId => adminId.toString() === userId);
    if (!isAdmin) return res.status(403).json({ message: "Access denied. Admins only." });

    const isMember = room.members.some(m => m.toString() === newAdminId);
    if (!isMember) {
      return res.status(400).json({ message: "User must be a member before becoming admin" });
    }

    if (room.admins.some(a => a.toString() === newAdminId)) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    room.admins.push(newAdminId);
    await room.save();

    res.status(200).json({ message: "Admin added successfully", room });
  } catch (err) {
    console.log(err);
    errorHandler(err, req, res);
  }
};

export const updateChatRoomInfo = async (req, res) => {
  try {
    const room = req.chatRoom;

    const allowedFields = ["name", "description", "isPrivate"];
    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    Object.assign(room, updates);
    await room.save();

    res.status(200).json({ message: "Chat room info updated", room });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

export const changePrivacyStatus = async (req, res) => {
  try {
    const room = req.chatRoom; // set by checkGroupAdmin
    const isPrivate = req.body?.isPrivate;

    if(isPrivate == null) {
      return res.status(400).json({
        message: "Please add the privacy"
      })
    }

    if (typeof isPrivate !== "boolean") {
      return res.status(400).json({ message: "isPrivate must be a boolean" });
    }

    room.isPrivate = isPrivate;
    await room.save();

    res.status(200).json({ message: `Chat room is now ${isPrivate ? "private" : "public"}` });
  } catch (err) {
    console.log(err);
    errorHandler(err, req, res);
  }
};

export const handlePrivateChat = async (req, res) => {
  const { user1, user2 } = req.body;

  try {
    const room = await findOrCreatePrivateRoom(user1, user2);
    return res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating private chat', error: err.message });
  }
};

export const handleGroupChat = async (req, res) => {
  try {
    const room = await createGroupChat(req.body);
    return res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating group chat', error: err.message });
  }
};

