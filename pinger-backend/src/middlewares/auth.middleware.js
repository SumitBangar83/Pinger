import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const verifyJWT = async (req, res, next) => {
  try {
    // Get token from header (format: "Bearer <token>")
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized request: No token provided' });
    }

    // Verify the token using our secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user based on the ID stored in the token
    const user = await User.findById(decodedToken?._id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid Access Token' });
    }

    // Attach the user object to the request for later use
    req.user = user;
    next(); // All good, proceed to the next function (the controller)
  } catch (error) {
    return res.status(401).json({ message: 'Invalid Access Token or Token Expired' });
  }
};