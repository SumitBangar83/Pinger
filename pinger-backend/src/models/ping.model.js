import mongoose, { Schema } from 'mongoose';

const pingSchema = new Schema(
  {
    // A reference to the Target this ping belongs to
    target: {
      type: Schema.Types.ObjectId,
      ref: 'Target', // This tells Mongoose to link to the 'Target' model
      required: true,
      index: true, // Index for faster queries
    },
    status: {
      type: String,
      enum: ['UP', 'DOWN'],
      required: true,
    },
    statusCode: {
      type: Number, // e.g., 200, 404, 500
    },
    responseTime: {
      type: Number, // Time in milliseconds
    },
    errorMessage: {
      type: String, // Store error message if the ping fails
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

export const Ping = mongoose.model('Ping', pingSchema);