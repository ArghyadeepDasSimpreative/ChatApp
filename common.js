import ChatRoom from './models/chatroom.model.js';

export async function findOrCreatePrivateRoom(user1, user2) {
  const existingRoom = await ChatRoom.findOne({
    isGroup: false,
    members: { $all: [user1, user2], $size: 2 },
  });

  if (existingRoom) return existingRoom;

  // Create the private chat room
  const newRoom = await ChatRoom.create({
    name: "Private Chat", // or use user names dynamically
    isGroup: false,
    type: "private",
    members: [user1, user2],
    admins: [user1], // optional
    createdBy: user1, // or whoever initiated
  });

  return newRoom;
}

/**
 * Create a group chat room with members and metadata
 */
export async function createGroupChat({ name, description, avatar, memberIds, adminIds, createdBy, tags, type = "private" }) {
  const room = await ChatRoom.create({
    name,
    description,
    avatar,
    isGroup: true,
    type, // "private", "public", or "protected"
    members: memberIds,
    admins: adminIds || [createdBy],
    createdBy,
    tags,
  });

  return room;
}
