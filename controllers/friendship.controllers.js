import { errorHandler } from "../lib/error.js";
import Friendship from "../models/friendship.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

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
    }).populate('requester', 'fullName email profileImage ');

    const formatted = requests.map(r => ({
      _id: r._id,
      requester: {
        _id: r.requester._id,
        name: r.requester.fullName,
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
    const requester = req.params.id;

    const request = await Friendship.findOne({
      requester: new mongoose.Types.ObjectId(requester),
      recipient: new mongoose.Types.ObjectId(currentUserId)
    });

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
      .select('fullName email profileImage');
      console.log("friends",friends);
      

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

export const blockFriend = async (req, res) => {
   try {
    const currentUserId = req.user.id;
    const requester = req.params.id;

    const request = await Friendship.findOne({
      requester: new mongoose.Types.ObjectId(requester),
      recipient: new mongoose.Types.ObjectId(currentUserId)
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Friend request not found.' });
    }

    if (request.status !== 'pending' && request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only pending requests and accepted friends can be blocked.' });
    }

    request.status = 'blocked';
    await request.save();

    return res.status(200).json({ success: true, message: 'Friend request blocked.' });
  } catch (error) {
    console.error('Error blocking the friend:', error);
    res.status(500).json({ success: false, message: 'Failed to block the friend.' });
  } 
}

export const blockList = async (req, res) => {
  try {
    const userId = req.user.id;

    const blockedFriends = await Friendship.find({
      status: 'blocked',
      $or: [
        { recipient: userId }
      ]
    });
    return res.status(200).json({
      success: true,
      blockedFriends
    });
  } catch (error) {
    console.error('Error fetching the blocked friends', error);
    res.status(500).json({ success: false, message: 'Failed to fetch the blocked friends.' });
  }
};

export const unblockFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const requester = req.params.id;
    const blockedFriend = await Friendship.find({
      status: 'blocked',
      $or: [
        { recipient: userId,
          requester: requester
         }
      ]
    });

    if (blockedFriend.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No blocked friendship found.'
      });
    } else {
        const request = await Friendship.findOne({
          requester: requester,
          recipient: userId,
          status: 'blocked'
        });

        if (!request) {
          return res.status(404).json({ success: false, message: 'Friendship not found.' });
        }

        if (request.requester.toString() !== requester) {
          return res.status(403).json({ success: false, message: 'Not authorized to unblock this friend.' });
        }

        if (request.status !== 'blocked') {
          return res.status(400).json({ success: false, message: 'Only blocked request can be unblocked.' });
        }

        const updatedResults= await Friendship.updateOne(
          { recipient: userId, requester: requester }, 
          { $set: { status: 'accepted' } }            
        );
        return res.status(200).json({
          success: true,
          updatedResults,
          messgae: 'Unblocked successfully.'
        });
    }
  } catch (error) {
    console.error('Error fetching the blocked friends', error);
    res.status(500).json({ success: false, message: 'Failed to fetch the blocked friends.' });
  }
};
