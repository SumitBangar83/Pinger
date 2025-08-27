import { User } from '../models/user.model.js';

// Controller for user registration
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ([username, email, password].some((field) => !field?.trim())) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
      return res.status(409).json({ message: 'User with email or username already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    // Remove password from the response
    const createdUser = await User.findById(user._id).select('-password');

    return res.status(201).json({ message: 'User registered successfully', data: createdUser });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Controller for user login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid user credentials' });
    }

    const accessToken = user.generateAccessToken();

    // Remove password from the response
    const loggedInUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      message: 'User logged in successfully',
      data: { user: loggedInUser, accessToken },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};