import express, { Router } from "express";
import { authorizeRole } from "../middlewares/authorize.js";
import { acceptFriendRequest, cancelFriendRequest, getFriendsList, getPendingFriendRequests, sendFriendRequest,blockFriend } from "../controllers/friendship.controllers.js";

const friendShipRoutes = express.Router();

friendShipRoutes.post("/", authorizeRole("user"), sendFriendRequest);
friendShipRoutes.get("/pending", authorizeRole("user"), getPendingFriendRequests);
friendShipRoutes.put("/:id", authorizeRole("user"), acceptFriendRequest);
friendShipRoutes.put("/block/:id", authorizeRole("user"), blockFriend);
friendShipRoutes.get("/", authorizeRole("user"), getFriendsList);
friendShipRoutes.delete("/:id/cancel", authorizeRole("user"), cancelFriendRequest);

export default friendShipRoutes;