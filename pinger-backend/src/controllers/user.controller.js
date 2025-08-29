import { User } from '../models/user.model.js';

// Controller for user registration
export const registerUser = async (req, res) => {
  const { username, email } = req.body;
  // LOG: Log the registration attempt
  console.log(`[LOG]: New user registration attempt for username: '${username}' and email: '${email}'.`);

  try {
    const { password } = req.body;

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

    const createdUser = await User.findById(user._id).select('-password');

    console.log(`[LOG]: User '${username}' registered successfully.`);
    return res.status(201).json({ message: 'User registered successfully', data: createdUser });
  } catch (error) {
    // LOG: Log the registration error
    console.error(`[ERROR] during registration for '${username}':`, error.message);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Controller for user login
export const loginUser = async (req, res) => {
  const { email } = req.body;
  // LOG: Log the login attempt
  console.log(`[LOG]: Login attempt for email: '${email}'.`);
  
  try {
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      // LOG: Log failed login attempt
      console.warn(`[WARN]: Failed login attempt for user: '${user.username}' due to invalid credentials.`);
      return res.status(401).json({ message: 'Invalid user credentials' });
    }

    const accessToken = user.generateAccessToken();
    const loggedInUser = await User.findById(user._id).select('-password');

    // LOG: Log successful login
    console.log(`[LOG]: User '${user.username}' logged in successfully.`);
    return res.status(200).json({
      message: 'User logged in successfully',
      data: { user: loggedInUser, accessToken },
    });
  } catch (error) {
    // LOG: Log the login error
    console.error(`[ERROR] during login for '${email}':`, error.message);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};