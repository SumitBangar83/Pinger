// src/index.js
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';
import { startScheduler } from './services/scheduler.service.js'; // <-- Yeh line import karein

dotenv.config({
  path: './.env',
});

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at port: ${PORT}`);
      
      // Start the scheduler after the server is running
      startScheduler(); // <-- Yeh line add karein
    });
  })
  .catch((err) => {
    console.log('Mongo DB connection failed !!! ', err);
  });