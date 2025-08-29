// src/app.js
import express from 'express';
import cors from 'cors';

// --- Router Import ---
import targetRouter from './routes/target.routes.js';
import userRouter from './routes/user.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Healthcheck route
app.use('/serverCheck', (req, res) => {
  res.status(200).json({ success: true, message: "SERVER CHECK : server is working fine" })
})

// --- Routes Declaration ---
app.use('/api/v1/users', userRouter);
app.use('/api/v1/targets', targetRouter);

export { app };