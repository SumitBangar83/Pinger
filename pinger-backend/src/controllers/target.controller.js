import { Target } from '../models/target.model.js';
import { addJob, removeJob, updateJob } from '../services/scheduler.service.js';
import { Ping } from '../models/ping.model.js';

// CREATE
export const createTarget = async (req, res) => {
  // LOG: Log the incoming request
  console.log(`[LOG]: User '${req.user.username}' is creating a new target.`);

  try {
    const { name, url, cronSchedule } = req.body;

    const newTarget = await Target.create({
      name,
      url,
      cronSchedule,
      owner: req.user._id,
    });

    if (newTarget.isActive) addJob(newTarget);
    return res.status(201).json({ message: 'Target created and job scheduled', data: newTarget });
  } catch (error) {
    // LOG: Log the error
    console.error('[ERROR] in createTarget:', error.message);
    if (error.code === 11000) return res.status(409).json({ message: 'URL already exists.' });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// READ
export const getAllTargets = async (req, res) => {
  // LOG: Log the incoming request
  console.log(`[LOG]: User '${req.user.username}' is fetching all targets.`);

  try {
    const targets = await Target.find({ owner: req.user._id });
    return res.status(200).json({ message: 'Targets fetched successfully', data: targets });
  } catch (error) {
    // LOG: Log the error
    console.error('[ERROR] in getAllTargets:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE
export const updateTarget = async (req, res) => {
  const { id } = req.params;
  // LOG: Log the incoming request
  console.log(`[LOG]: User '${req.user.username}' is updating target ID: ${id}.`);

  try {
    const updatedTarget = await Target.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedTarget) return res.status(404).json({ message: 'Target not found or you are not the owner' });

    updateJob(updatedTarget);
    return res.status(200).json({ message: 'Target updated', data: updatedTarget });
  } catch (error) {
    // LOG: Log the error
    console.error(`[ERROR] in updateTarget for ID ${id}:`, error.message);
    if (error.code === 11000) return res.status(409).json({ message: 'URL already exists.' });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE
export const deleteTarget = async (req, res) => {
  const { id } = req.params;
  // LOG: Log the incoming request
  console.log(`[LOG]: User '${req.user.username}' is deleting target ID: ${id}.`);

  try {
    const deletedTarget = await Target.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!deletedTarget) return res.status(404).json({ message: 'Target not found or you are not the owner' });
    await Ping.deleteMany({ target: id });
    removeJob(id);
    return res.status(200).json({ message: 'Target deleted and job stopped' });
  } catch (error) {
    // LOG: Log the error
    console.error(`[ERROR] in deleteTarget for ID ${id}:`, error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET HISTORY
export const getTargetHistory = async (req, res) => {
  const { id } = req.params;
  const { days } = req.query; // Get 'days' from query params like ?days=7

  console.log(`[LOG]: User '${req.user.username}' is fetching history for target ID: ${id} for last ${days || 'all'} days.`);

  try {
    const target = await Target.findOne({ _id: id, owner: req.user._id });
    if (!target) return res.status(404).json({ message: 'Target not found or not owned by user' });

    let query = { target: id };

    // If 'days' is provided, add a date filter to the query
    if (days && !isNaN(parseInt(days))) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.createdAt = { $gte: startDate };
    }

    const history = await Ping.find(query).sort({ createdAt: -1 }).limit(500); // Limit to 500 records
    return res.status(200).json({ message: 'History fetched', data: history });
  } catch (error) {
    console.error(`[ERROR] in getTargetHistory for ID ${id}:`, error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};