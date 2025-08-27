import mongoose, { Schema } from 'mongoose';

const targetSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      // Note: We'll remove the global unique constraint later if needed, 
      // as different users might monitor the same URL. For now, it's fine.
      unique: true,
      trim: true,
    },
    cronSchedule: {
      type: String,
      required: [true, 'Cron schedule is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN', 'PENDING'],
      default: 'PENDING',
    },
    // Yeh field har target ko ek user se jodega
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Target = mongoose.model('Target', targetSchema);