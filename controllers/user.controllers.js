import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
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
