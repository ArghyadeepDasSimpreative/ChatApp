import mongoose from 'mongoose';
 
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // must match your User model
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // must match your User model
    required: true,
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "text",
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });
 
const Message = mongoose.model('Message', messageSchema);
 
export default Message;