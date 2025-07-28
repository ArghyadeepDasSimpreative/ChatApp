import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import ChatRoom from '../models/chatroom.model.js';
import User from '../models/user.model.js';

// export const handleSendMessage = async (io, socket, data) => {
//   console.log("📥 Server received message payload:", data);

//   const { sender, chatRoomId, content } = data;
//   if (!sender || !chatRoomId || !content) {
//     console.warn("❌ Missing fields in message");
//     return;
//   }

//   try {
//     const newMessage = await Message.create({
//       sender,
//       chatRoom: chatRoomId,
//       content,
//       type: data.type || "text",
//       isLiked: false,
//     });

//     console.log("📤 Emitting message to room:", chatRoomId);
//     io.to(chatRoomId).emit("receive_message", newMessage);
//   } catch (error) {
//     console.error("❌ Error saving message:", error);
//   }
// };

export const handleSendMessage = async (socket, io, data) => {
  console.log("📥 Server received message payload:", data);
 
  const { sender, chatRoomId, content } = data;
  if (!sender || !chatRoomId || !content) {
    console.warn("❌ Missing fields in message");
    return;
  }
 
  try {
    // 1. Create message
    const newMessage = await Message.create({
      sender,
      chatRoom: chatRoomId,
      content,
      type: data.type || "text",
      isLiked: false,
    });
 
    // 2. Populate sender details (name + profile image)
    const populatedMessage = await newMessage.populate('sender', 'name profileImage');
 
    // 3. Format createdAt to readable time
    const formattedMessage = {
      ...populatedMessage.toObject(),
      time: new Date(populatedMessage.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
 
    // 4. Emit to chat room
    console.log("📤 Emitting message to room:", chatRoomId);
    io.to(chatRoomId).emit("receive_message", formattedMessage);
  } catch (error) {
    console.error("❌ Error saving message:", error);
  }
};
 
 