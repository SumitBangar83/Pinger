import mongoose, { Schema } from 'mongoose';

const pingSchema = new Schema(
  {
    target: {
      type: Schema.Types.ObjectId,
      ref: 'Target',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN'],
      required: true,
    },
    success: { // <-- YEH NAYA FIELD ADD KAREIN
      type: Boolean,
    },
    statusCode: {
      type: Number,
    },
    responseTime: {
      type: Number,
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Ping = mongoose.model('Ping', pingSchema);