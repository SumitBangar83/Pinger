// src/config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Sirf environment variable se URI use karein
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error('MongoDB connection FAILED: ', error);
    process.exit(1);
  }
};

export default connectDB;