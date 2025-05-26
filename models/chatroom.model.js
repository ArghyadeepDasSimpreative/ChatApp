import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: {
      type: String,
      maxlength: [200, "Description must not exceed 200 characters"]
    },
    avatar: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isGroup: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ["public", "private", "protected"],
      default: "private",
    },
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
    },
    lastActiveAt: { type: Date, default: Date.now },
    mutedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messagesCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
