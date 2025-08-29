import cron from 'node-cron';
import axios from 'axios';
import { Target } from '../models/target.model.js';
import { Ping } from '../models/ping.model.js';

const scheduledJobs = new Map();

const pingTarget = async (target) => {
  const startTime = Date.now();

  try {
    const response = await axios.get(target.url, { timeout: 10000 });
    const responseTime = Date.now() - startTime;

    const isSuccess = response.data && response.data.success === true;
    const currentStatus = isSuccess ? 'UP' : 'DOWN';

    await Target.findByIdAndUpdate(target._id, { status: currentStatus });

    await Ping.create({
      target: target._id,
      status: currentStatus,
      success: isSuccess, // <-- success field add karein
      statusCode: response.status,
      responseTime,
    });
    console.log(`✅ PINGED: ${target.name} | Status: ${currentStatus}`);

  } catch (error) {
    const responseTime = Date.now() - startTime;

    await Target.findByIdAndUpdate(target._id, { status: 'DOWN' });

    await Ping.create({
      target: target._id,
      status: 'DOWN',
      success: false, // <-- yahan bhi success field add karein
      statusCode: error.response ? error.response.status : null,
      responseTime,
      errorMessage: error.message,
    });
    console.error(`❌ FAILED: Pinging ${target.name}. Error: ${error.message}`);
  }
};

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

// This function is now updated
export const startScheduler = async () => {
  console.log('🚀 Starting scheduler...');

  // --- SELF-PINGING LOGIC ---
  const selfUrl = process.env.SELF_URL;
  if (selfUrl) {
    cron.schedule('*/1 * * * *', () => {
      // Change the URL here to include /serverCheck
      axios.get(`${selfUrl}/serverCheck`)
        .then(response => console.log(`[LOG] Self-ping successful. Status: ${response.status}`))
        .catch(error => console.error(`[ERROR] Self-ping failed: ${error.message}`));
    });
    console.log(`Self-pinging job scheduled for ${selfUrl}/serverCheck`);
  }
  // --- END OF SELF-PINGING LOGIC ---

  // Fetches user-defined targets from the database and schedules them
  const activeTargets = await Target.find({ isActive: true });
  activeTargets.forEach((target) => {
    addJob(target);
  });
  console.log(`Scheduler started with ${scheduledJobs.size} user-defined jobs.`);
};