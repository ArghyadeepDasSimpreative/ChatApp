import express, { Router } from "express";
import { authorizeRole } from "../middlewares/authorize.js";
import { acceptFriendRequest, cancelFriendRequest, getFriendsList, getPendingFriendRequests, sendFriendRequest,blockFriend, blockList, unblockFriend } from "../controllers/friendship.controllers.js";

const friendShipRoutes = express.Router();

friendShipRoutes.post("/", authorizeRole("user"), sendFriendRequest);
friendShipRoutes.get("/pending", authorizeRole("user"), getPendingFriendRequests);
friendShipRoutes.post("/:id", authorizeRole("user"), acceptFriendRequest);
friendShipRoutes.post("/block/:id", authorizeRole("user"), blockFriend);
friendShipRoutes.get("/", authorizeRole("user"), getFriendsList);
friendShipRoutes.delete("/:id/cancel", authorizeRole("user"), cancelFriendRequest);
friendShipRoutes.get("/blockList", authorizeRole("user"), blockList);
friendShipRoutes.get("/unblock-friend/:id", authorizeRole("user"), unblockFriend);

export default friendShipRoutes;