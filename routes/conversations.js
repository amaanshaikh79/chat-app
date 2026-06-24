const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'username email avatar status lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversations'
    });
  }
});

// @route   POST /api/conversations/private
// @desc    Create or get private conversation
// @access  Private
router.post('/private', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Find or create private conversation
    const conversation = await Conversation.findOrCreatePrivate(currentUserId, userId);

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Create private conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating conversation'
    });
  }
});

// @route   POST /api/conversations/group
// @desc    Create group conversation
// @access  Private
router.post('/group', authMiddleware, async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    const currentUserId = req.user._id;

    if (!name || !participantIds || participantIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group name and at least 2 participants are required'
      });
    }

    // Add current user to participants
    const allParticipants = [currentUserId, ...participantIds];

    const conversation = await Conversation.create({
      type: 'group',
      name,
      participants: allParticipants,
      createdBy: currentUserId
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username email avatar status lastSeen');

    res.status(201).json({
      success: true,
      conversation: populatedConversation
    });
  } catch (error) {
    console.error('Create group conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating group'
    });
  }
});

// @route   GET /api/conversations/:conversationId
// @desc    Get conversation by ID
// @access  Private
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate('participants', 'username email avatar status lastSeen');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversation'
    });
  }
});

module.exports = router;
