import Friendship from '../models/Friendship.js';

const checkFriendship = async (req, res, next) => {
  const userId1 = req.user.id;           // Authenticated user
  const userId2 = req.params.userId;     // Target user

  try {
    const friendship = await Friendship.findOne({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 },
      ],
      status: 'accepted',
    });

    if (!friendship) {
      return res.status(403).json({ error: 'You are not friends with this user.' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error checking friendship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default checkFriendship;
