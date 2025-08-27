import { Target } from '../models/target.model.js';
import { addJob, removeJob, updateJob } from '../services/scheduler.service.js';

// CREATE
export const createTarget = async (req, res) => {
  try {
    const { name, url, cronSchedule } = req.body;
    
    const newTarget = await Target.create({
      name,
      url,
      cronSchedule,
      owner: req.user._id, // <-- Logged-in user ki ID ko owner banayein
    });
    
    if (newTarget.isActive) addJob(newTarget);
    return res.status(201).json({ message: 'Target created and job scheduled', data: newTarget });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'URL already exists.' });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// READ
export const getAllTargets = async (req, res) => {
  try {
    // Sirf logged-in user ke targets find karein
    const targets = await Target.find({ owner: req.user._id });
    return res.status(200).json({ message: 'Targets fetched successfully', data: targets });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE
export const updateTarget = async (req, res) => {
  try {
    const { id } = req.params;
    // Find करो aur update करो sirf agar owner match hota hai
    const updatedTarget = await Target.findOneAndUpdate(
        { _id: id, owner: req.user._id }, 
        req.body, 
        { new: true }
    );

    if (!updatedTarget) return res.status(404).json({ message: 'Target not found or you are not the owner' });
    
    updateJob(updatedTarget);
    return res.status(200).json({ message: 'Target updated', data: updatedTarget });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'URL already exists.' });
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE
export const deleteTarget = async (req, res) => {
  try {
    const { id } = req.params;
    // Find करो aur delete करो sirf agar owner match hota hai
    const deletedTarget = await Target.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!deletedTarget) return res.status(404).json({ message: 'Target not found or you are not the owner' });
    
    removeJob(id);
    return res.status(200).json({ message: 'Target deleted and job stopped' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ... getTargetHistory ko bhi secure karein
import { Ping } from '../models/ping.model.js';

export const getTargetHistory = async (req, res) => {
    try {
        const { id } = req.params;
        // Pehle check karein ki user is target ka owner hai ya nahi
        const target = await Target.findOne({ _id: id, owner: req.user._id });
        if (!target) return res.status(404).json({ message: 'Target not found or you are not the owner' });

        const history = await Ping.find({ target: id }).sort({ createdAt: -1 }).limit(100);
        return res.status(200).json({ message: 'Ping history fetched', data: history });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};