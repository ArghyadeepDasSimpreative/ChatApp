import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Friendship from '../models/friendship.model.js';
import { errorHandler } from '../lib/error.js';

const JWT_SECRET = process.env.JWT_SECRET

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if(!fullName || !email || !phoneNumber || !password || !role) {
        return res.status(400).json({
            message: "Please provide all data",
        })
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorHandler(
        { statusCode: 400, message: 'Email already registered' },
        req,
        res
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || 'user',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user._id,
    });
  } catch (err) {
    console.log(err)
    errorHandler(err, req, res);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorHandler(
        { statusCode: 401, message: 'Invalid email or password' },
        req,
        res
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorHandler(
        { statusCode: 401, message: 'Invalid email or password' },
        req,
        res
      );
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, description, phoneNumber } = req.body;
    const profileImageURL = req.file.path;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(fullName && { fullName }),
        ...(description && { description }),
        ...(profileImageURL && { profileImageURL })
      },
      { new: true, runValidators: true }
    ).select('-password'); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUsersList = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.id } },
      "fullName description email profileImageURL"
    );

    const userIds = users.map(u => u._id);

    const friendships = await Friendship.find({
      $or: [
        { requester: req.user.id, recipient: { $in: userIds } },
        { recipient: req.user.id, requester: { $in: userIds } }
      ]
    });

    const result = users.map(user => {
      const friendship = friendships.find(f =>
        (f.requester.toString() === req.user.id && f.recipient.toString() === user._id.toString()) ||
        (f.recipient.toString() === req.user.id && f.requester.toString() === user._id.toString())
      );

      return {
        ...user.toObject(),
        friendship_status: friendship?.status === 'pending' ? 1 :
          friendship?.status === 'accepted' ? 2 :
          friendship?.status === 'rejected' ? 3 :
          friendship?.status === 'blocked' ? 4 : 0
      };
    });
    return res.status(200).json({ success: true, users: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try{
    const authenticated_user_id = req.user.id;
    const user_id = req.params.id;
    if(parseInt(authenticated_user_id) != parseInt(user_id)){
      return res.status(400).json({
        message: 'The user is not authorized to fetch the profile.'
      })
    }
    const users = await User.find(
      { _id:  req.user.id },
      "fullName description email profileImageURL"
    );
    if(users.length>0){
      return res.status(200).json({
        message: "User fetched successfully.",
        data: users
      })
    }else{
      return res.status(404).json({
        message: "User is not found.",
      })
    }
  } catch(error){
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}