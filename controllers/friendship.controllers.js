import { errorHandler } from "../lib/error.js";
import Friendship from "../models/friendship.model.js";
import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
  const requesterId = req.user.id;
  const targetEmail = req.body.email;

  if (!targetEmail) {
    return res.status(400).json({ error: 'Target email is required.' });
  }

  try {
    const recipientUser = await User.findOne({ email: targetEmail });
    if (!recipientUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (recipientUser._id.toString() === requesterId) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself.' });
    }

    // Check for existing friendship (either direction)
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientUser._id },
        { requester: recipientUser._id, recipient: requesterId },
      ],
    });

    if (existing) {
      return res.status(400).json({ error: `Friendship already exists or pending. Status: ${existing.status}` });
    }

    const friendRequest = new Friendship({
      requester: requesterId,
      recipient: recipientUser._id,
      status: 'pending',
    });

    await friendRequest.save();

    res.status(201).json({ message: 'Friend request sent successfully.' });
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    errorHandler(error, req, res)
  }
};

export const getPendingFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const requests = await Friendship.find({
      recipient: currentUserId,
      status: 'pending',
    }).populate('requester', 'name email profileImage');

    const formatted = requests.map(r => ({
      _id: r._id,
      requester: {
        _id: r.requester._id,
        name: r.requester.name,
        email: r.requester.email,
        profileImage: r.requester.profileImage || null,
      },
      requestedAt: r.createdAt,
    }));

    res.status(200).json({ success: true, requests: formatted });
  } catch (err) {
    console.error('Error fetching friend requests:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const requestId = req.params.id;

    const request = await Friendship.findById(requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Friend request not found.' });
    }

    if (request.recipient.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this request.' });
    }

    if (request.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Friend request already accepted.' });
    }

    request.status = 'accepted';
    await request.save();

    res.status(200).json({ success: true, message: 'Friend request accepted successfully.' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all accepted friendships involving the user
    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    // Extract friend IDs (not the current user)
    const friendIds = friendships.map(f => 
      f.requester.toString() === userId ? f.recipient : f.requester
    );

    // Get user details
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('name email profileImage');

    res.status(200).json({
      success: true,
      friends,
    });
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friends list.',
    });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { id } = req.body; // Friendship document ID

    const request = await Friendship.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Friend request not found.' });
    }

    if (request.requester.toString() !== requesterId) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled.' });
    }

    await Friendship.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Friend request cancelled.' });
  } catch (error) {
    console.error('Error cancelling friend request:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel friend request.' });
  }
};


