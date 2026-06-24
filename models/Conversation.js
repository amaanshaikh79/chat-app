const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    required: true,
    default: 'group'
  },
  name: {
    type: String,
    trim: true,
    default: null // Only for group chats
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1, participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Static method to find or create a private conversation between two users
conversationSchema.statics.findOrCreatePrivate = async function(userId1, userId2) {
  try {
    // Find existing conversation between these two users
    let conversation = await this.findOne({
      type: 'private',
      participants: { $all: [userId1, userId2], $size: 2 }
    }).populate('participants', 'username email avatar status lastSeen');

    // If not found, create new private conversation
    if (!conversation) {
      conversation = await this.create({
        type: 'private',
        participants: [userId1, userId2]
      });
      
      // Populate participants after creation
      conversation = await this.findById(conversation._id)
        .populate('participants', 'username email avatar status lastSeen');
    }

    return conversation;
  } catch (error) {
    throw error;
  }
};

// Method to add participant (for group chats)
conversationSchema.methods.addParticipant = async function(userId) {
  if (this.type !== 'group') {
    throw new Error('Can only add participants to group conversations');
  }
  
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    await this.save();
  }
  
  return this;
};

// Method to remove participant (for group chats)
conversationSchema.methods.removeParticipant = async function(userId) {
  if (this.type !== 'group') {
    throw new Error('Can only remove participants from group conversations');
  }
  
  this.participants = this.participants.filter(id => !id.equals(userId));
  await this.save();
  
  return this;
};

module.exports = mongoose.model('Conversation', conversationSchema);
