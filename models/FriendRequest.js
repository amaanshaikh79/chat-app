const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index to prevent duplicate requests
friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

// Index for efficient queries
friendRequestSchema.index({ recipient: 1, status: 1 });
friendRequestSchema.index({ sender: 1, status: 1 });

// Static method to send friend request
friendRequestSchema.statics.sendRequest = async function(senderId, recipientId) {
  // Check if request already exists
  const existingRequest = await this.findOne({
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId }
    ]
  });

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      throw new Error('Friend request already sent');
    } else if (existingRequest.status === 'accepted') {
      throw new Error('Already friends');
    } else {
      // If rejected, allow sending again by updating status
      existingRequest.status = 'pending';
      existingRequest.sender = senderId;
      existingRequest.recipient = recipientId;
      existingRequest.createdAt = Date.now();
      return await existingRequest.save();
    }
  }

  // Create new request
  return await this.create({ sender: senderId, recipient: recipientId });
};

// Static method to accept friend request
friendRequestSchema.statics.acceptRequest = async function(requestId, userId) {
  const request = await this.findOne({
    _id: requestId,
    recipient: userId,
    status: 'pending'
  });

  if (!request) {
    throw new Error('Friend request not found');
  }

  request.status = 'accepted';
  await request.save();

  return request;
};

// Static method to reject friend request
friendRequestSchema.statics.rejectRequest = async function(requestId, userId) {
  const request = await this.findOne({
    _id: requestId,
    recipient: userId,
    status: 'pending'
  });

  if (!request) {
    throw new Error('Friend request not found');
  }

  request.status = 'rejected';
  await request.save();

  return request;
};

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
