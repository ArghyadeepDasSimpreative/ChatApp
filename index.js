import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import connectToDB from "./database/config.js";
import authRoutes from "./routes/user.routes.js";
import chatRoomRoutes from "./routes/chatroom.routes.js";
import { handleSendMessage } from "./socket/message.js";
import friendShipRoutes from "./routes/friendship.routes.js";

dotenv.config();
connectToDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("send_message", (data) => handleSendMessage(socket, io, data));

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
  socket.on("join_chatroom", (chatRoomId) => {
    console.log("from socket chatroom id is ", chatRoomId)
    socket.join(chatRoomId); // now the socket is listening to this room
  });

});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/chatroom", chatRoomRoutes);
app.use("/api/friendship", friendShipRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
