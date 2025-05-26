import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const friendshipSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Optional: Ensure uniqueness of a friendship request
friendshipSchema.index(
  { requester: 1, recipient: 1 },
  { unique: true }
);

const Friendship = model('Friendship', friendshipSchema);
export default Friendship;
