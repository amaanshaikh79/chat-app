const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// @route   POST /api/friends/request
// @desc    Send friend request
// @access  Private
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (req.user.friends.includes(recipientId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Send request
    const friendRequest = await FriendRequest.sendRequest(req.user._id, recipientId);

    await friendRequest.populate([
      { path: 'sender', select: 'username email avatar profilePicture' },
      { path: 'recipient', select: 'username email avatar profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      friendRequest
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/friends/accept/:requestId
// @desc    Accept friend request
// @access  Private
router.post('/accept/:requestId', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Accept request
    const friendRequest = await FriendRequest.acceptRequest(requestId, req.user._id);

    await friendRequest.populate([
      { path: 'sender', select: 'username email avatar profilePicture' },
      { path: 'recipient', select: 'username email avatar profilePicture' }
    ]);

    // Add each user to other's friends list
    await User.findByIdAndUpdate(friendRequest.sender._id, {
      $addToSet: { friends: friendRequest.recipient._id }
    });

    await User.findByIdAndUpdate(friendRequest.recipient._id, {
      $addToSet: { friends: friendRequest.sender._id }
    });

    res.json({
      success: true,
      friendRequest
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/friends/reject/:requestId
// @desc    Reject friend request
// @access  Private
router.post('/reject/:requestId', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.rejectRequest(requestId, req.user._id);

    await friendRequest.populate([
      { path: 'sender', select: 'username email avatar profilePicture' },
      { path: 'recipient', select: 'username email avatar profilePicture' }
    ]);

    res.json({
      success: true,
      friendRequest
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/friends/:userId
// @desc    Remove friend
// @access  Private
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.user.friends.includes(userId)) {
      return res.status(400).json({ message: 'Not friends with this user' });
    }

    // Remove from both users' friends lists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: req.user._id }
    });

    res.json({
      success: true,
      message: 'Friend removed'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends
// @desc    Get friends list with online status
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'username email avatar profilePicture status lastSeen');

    // Sort friends: online first, then by username
    const friends = user.friends.sort((a, b) => {
      if (a.status === 'online' && b.status !== 'online') return -1;
      if (a.status !== 'online' && b.status === 'online') return 1;
      return a.username.localeCompare(b.username);
    });

    res.json({
      success: true,
      friends
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friends/requests
// @desc    Get pending friend requests (incoming and outgoing)
// @access  Private
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get incoming requests (where user is recipient)
    const incoming = await FriendRequest.find({
      recipient: userId,
      status: 'pending'
    })
      .populate('sender', 'username email avatar profilePicture')
      .sort({ createdAt: -1 });

    // Get outgoing requests (where user is sender)
    const outgoing = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    })
      .populate('recipient', 'username email avatar profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      incoming,
      outgoing
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
