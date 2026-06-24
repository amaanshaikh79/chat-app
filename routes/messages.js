const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/:conversationId
// @desc    Get messages for a conversation
// @access  Private
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { limit = 50, before } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Build query
    const query = {
      conversationId,
      isDeleted: false
    };

    // Pagination: get messages before a certain timestamp
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Reverse to get chronological order
    messages.reverse();

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    });
  }
});

// @route   PUT /api/messages/:messageId
// @desc    Edit a message
// @access  Private
router.put('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized'
      });
    }

    // Check if message can be edited (15 minutes window)
    if (!message.canEdit()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit message after 15 minutes'
      });
    }

    message.text = text.trim();
    message.isEdited = true;
    message.editedAt = Date.now();
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'username email avatar');

    res.status(200).json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error editing message'
    });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized'
      });
    }

    message.isDeleted = true;
    message.deletedAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
});

module.exports = router;
