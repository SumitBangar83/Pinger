// src/services/scheduler.service.js

import cron from 'node-cron';
import axios from 'axios';
import { Target } from '../models/target.model.js';
import { Ping } from '../models/ping.model.js';
const scheduledJobs = new Map();

const pingTarget = async (target) => {
  const startTime = Date.now(); // Record start time

  try {
    const response = await axios.get(target.url, { timeout: 10000 });
    const responseTime = Date.now() - startTime; // Calculate response time

    const isSuccess = response.data && response.data.success === true;
    const currentStatus = isSuccess ? 'UP' : 'DOWN';

    // Update the target's status
    await Target.findByIdAndUpdate(target._id, { status: currentStatus });

    // Create a new ping history record
    await Ping.create({
      target: target._id,
      status: currentStatus,
      statusCode: response.status,
      responseTime,
    });

    console.log(`✅ PINGED: ${target.name} | Status: ${currentStatus} | Response Time: ${responseTime}ms`);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error.response ? error.response.status : null;

    // Update the target's status to DOWN
    await Target.findByIdAndUpdate(target._id, { status: 'DOWN' });

    // Create a new ping history record for the failure
    await Ping.create({
      target: target._id,
      status: 'DOWN',
      statusCode,
      responseTime,
      errorMessage: error.message,
    });

    console.error(`❌ FAILED: Pinging ${target.name}. Error: ${error.message}`);
  }
};

// NAYA FUNCTION: Ek naye target ke liye job schedule karne ke liye
export const addJob = (target) => {
  if (cron.validate(target.cronSchedule)) {
    const job = cron.schedule(target.cronSchedule, () => {
      pingTarget(target);
    });
    scheduledJobs.set(target._id.toString(), job);
    console.log(`NEW JOB ADDED: ${target.name} with schedule: ${target.cronSchedule}`);
  }
};

// NAYA FUNCTION: Ek job ko rokne aur hatane ke liye
export const removeJob = (targetId) => {
  const job = scheduledJobs.get(targetId.toString());
  if (job) {
    job.stop();
    scheduledJobs.delete(targetId.toString());
    console.log(`JOB REMOVED: for target ID ${targetId}`);
  }
};

// NAYA FUNCTION: Ek job ko update karne ke liye
export const updateJob = (target) => {
  // Purana job hatao
  removeJob(target._id);
  // Naya job add karo
  addJob(target);
  console.log(`JOB UPDATED: for target ${target.name}`);
};

// PURANA FUNCTION (thoda modified)
export const startScheduler = async () => {
  console.log('🚀 Starting scheduler...');
  const activeTargets = await Target.find({ isActive: true });
  activeTargets.forEach((target) => {
    addJob(target); // Ab hum addJob function ka use kar rahe hain
  });
  console.log(`Scheduler started with ${scheduledJobs.size} jobs.`);
};