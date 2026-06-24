require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const { verifySocketToken } = require('./middleware/auth');

// Import models
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const FriendRequest = require('./models/FriendRequest');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const friendRoutes = require('./routes/friends');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);

// Socket maps
const userSockets = new Map();   // userId -> socketId
const socketUsers = new Map();   // socketId -> userId
const conversationUnreadCount = new Map(); // conversationId:userId -> count

// Helper: Get user's socket
function getUserSocket(userId) {
  const socketId = userSockets.get(userId.toString());
  return socketId ? io.sockets.sockets.get(socketId) : null;
}

// Helper: Emit to user's friends only
async function emitToFriends(userId, event, data) {
  try {
    const user = await User.findById(userId).select('friends');
    if (!user) return;

    user.friends.forEach(friendId => {
      const socket = getUserSocket(friendId);
      if (socket) {
        socket.emit(event, data);
      }
    });
  } catch (error) {
    console.error('Error emitting to friends:', error);
  }
}

// Helper: Emit to conversation participants
async function emitToConversation(conversationId, event, data, excludeSocketId = null) {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    conversation.participants.forEach(participantId => {
      const socket = getUserSocket(participantId);
      if (socket && socket.id !== excludeSocketId) {
        socket.emit(event, data);
      }
    });
  } catch (error) {
    console.error('Error emitting to conversation:', error);
  }
}

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const result = await verifySocketToken(token);
    
    if (!result.success) {
      return next(new Error(result.message));
    }

    socket.userId = result.user._id.toString();
    socket.user = result.user;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  const userId = socket.userId;
  console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

  // Handle duplicate sessions - disconnect old socket
  if (userSockets.has(userId)) {
    const oldSocketId = userSockets.get(userId);
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
      oldSocket.emit('force logout', { reason: 'duplicate_session' });
      oldSocket.disconnect(true);
    }
  }

  // Register user socket
  userSockets.set(userId, socket.id);
  socketUsers.set(socket.id, userId);

  // Update user status to online
  await User.findByIdAndUpdate(userId, {
    status: 'online',
    lastSeen: Date.now()
  });

  // Notify friends (not everyone) about online status
  emitToFriends(userId, 'user status', {
    userId,
    status: 'online',
    lastSeen: Date.now()
  });

  // Join user's conversations
  try {
    const conversations = await Conversation.find({ participants: userId });
    conversations.forEach(conv => {
      socket.join(conv._id.toString());
    });
  } catch (error) {
    console.error('Error joining conversations:', error);
  }

  // ----- GROUP CHAT EVENTS -----

  // Get global conversation or create one
  socket.on('join global', async (callback) => {
    try {
      // Find or create global conversation
      let globalConv = await Conversation.findOne({ 
        type: 'group', 
        name: 'Global Chat' 
      });

      if (!globalConv) {
        globalConv = await Conversation.create({
          type: 'group',
          name: 'Global Chat',
          participants: [userId]
        });
      } else if (!globalConv.participants.includes(userId)) {
        globalConv.participants.push(userId);
        await globalConv.save();
      }

      socket.join(globalConv._id.toString());

      // Load recent messages
      const messages = await Message.find({
        conversationId: globalConv._id,
        isDeleted: false
      })
        .populate('sender', 'username email avatar')
        .sort({ createdAt: -1 })
        .limit(50);

      messages.reverse();

      // Get online users in global chat
      const onlineUsers = await User.find({
        _id: { $in: globalConv.participants },
        status: 'online'
      }).select('username avatar status');

      callback({
        success: true,
        conversationId: globalConv._id,
        messages,
        onlineUsers
      });

      // Notify others
      socket.to(globalConv._id.toString()).emit('user joined', {
        user: {
          _id: userId,
          username: socket.user.username
        }
      });
    } catch (error) {
      console.error('Join global error:', error);
      callback({ success: false, message: error.message });
    }
  });

  // ----- PRIVATE MESSAGING EVENTS -----

  // Join or create private conversation
  socket.on('join private', async (data, callback) => {
    try {
      const { recipientId } = data;

      if (!recipientId) {
        return callback({ success: false, message: 'Recipient ID required' });
      }

      // Find or create private conversation
      const conversation = await Conversation.findOrCreatePrivate(userId, recipientId);
      
      socket.join(conversation._id.toString());

      // Load messages
      const messages = await Message.find({
        conversationId: conversation._id,
        isDeleted: false
      })
        .populate('sender', 'username email avatar')
        .sort({ createdAt: -1 })
        .limit(50);

      messages.reverse();

      callback({
        success: true,
        conversationId: conversation._id,
        conversation,
        messages
      });
    } catch (error) {
      console.error('Join private error:', error);
      callback({ success: false, message: error.message });
    }
  });

  // ----- MESSAGE EVENTS -----

  // Send message
  socket.on('send message', async (data, callback) => {
    try {
      const { conversationId, text, tempId } = data;

      if (!text || !text.trim()) {
        return callback({ success: false, message: 'Message text required' });
      }

      // Verify user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId
      });

      if (!conversation) {
        return callback({ success: false, message: 'Conversation not found' });
      }

      // Create message
      const message = await Message.create({
        conversationId,
        sender: userId,
        text: text.trim(),
        messageType: 'text'
      });

      // Update conversation's last message
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = message.createdAt;
      await conversation.save();

      // Populate sender
      await message.populate('sender', 'username email avatar');

      // Emit to all participants in conversation
      io.to(conversationId).emit('message', {
        ...message.toObject(),
        tempId
      });

      callback({ success: true, message });
    } catch (error) {
      console.error('Send message error:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Edit message
  socket.on('edit message', async (data, callback) => {
    try {
      const { messageId, text } = data;

      if (!text || !text.trim()) {
        return callback({ success: false, message: 'Message text required' });
      }

      const message = await Message.findOne({
        _id: messageId,
        sender: userId,
        isDeleted: false
      });

      if (!message) {
        return callback({ success: false, message: 'Message not found' });
      }

      if (!message.canEdit()) {
        return callback({ success: false, message: 'Cannot edit after 15 minutes' });
      }

      message.text = text.trim();
      message.isEdited = true;
      message.editedAt = Date.now();
      await message.save();

      await message.populate('sender', 'username email avatar');

      // Emit to conversation
      io.to(message.conversationId.toString()).emit('message edited', message);

      callback({ success: true, message });
    } catch (error) {
      console.error('Edit message error:', error);
      callback({ success: false, message: error.message });
    }
  });

  // Delete message
  socket.on('delete message', async (data, callback) => {
    try {
      const { messageId } = data;

      const message = await Message.findOne({
        _id: messageId,
        sender: userId,
        isDeleted: false
      });

      if (!message) {
        return callback({ success: false, message: 'Message not found' });
      }

      message.isDeleted = true;
      message.deletedAt = Date.now();
      await message.save();

      // Emit to conversation
      io.to(message.conversationId.toString()).emit('message deleted', {
        messageId,
        conversationId: message.conversationId
      });

      callback({ success: true });
    } catch (error) {
      console.error('Delete message error:', error);
      callback({ success: false, message: error.message });
    }
  });

  // ----- TYPING INDICATORS -----

  socket.on('typing', async (data) => {
    try {
      const { conversationId } = data;
      socket.to(conversationId).emit('typing', {
        userId,
        username: socket.user.username,
        conversationId
      });
    } catch (error) {
      console.error('Typing error:', error);
    }
  });

  socket.on('stop typing', async (data) => {
    try {
      const { conversationId } = data;
      socket.to(conversationId).emit('stop typing', {
        userId,
        conversationId
      });
    } catch (error) {
      console.error('Stop typing error:', error);
    }
  });

  // ----- FRIEND REQUESTS -----

  socket.on('friend request', async (data, callback) => {
    try {
      const { recipientId } = data;
      
      const friendRequest = await FriendRequest.sendRequest(userId, recipientId);
      await friendRequest.populate([
        { path: 'sender', select: 'username email avatar profilePicture' },
        { path: 'recipient', select: 'username email avatar profilePicture' }
      ]);

      // Notify recipient in real-time
      const recipientSocket = getUserSocket(recipientId);
      if (recipientSocket) {
        recipientSocket.emit('friend request received', friendRequest);
      }

      callback({ success: true, friendRequest });
    } catch (error) {
      console.error('Friend request error:', error);
      callback({ success: false, message: error.message });
    }
  });

  socket.on('accept friend request', async (data, callback) => {
    try {
      const { requestId } = data;

      const friendRequest = await FriendRequest.acceptRequest(requestId, userId);
      await friendRequest.populate([
        { path: 'sender', select: 'username email avatar profilePicture status' },
        { path: 'recipient', select: 'username email avatar profilePicture status' }
      ]);

      // Add to friends lists
      await User.findByIdAndUpdate(friendRequest.sender._id, {
        $addToSet: { friends: friendRequest.recipient._id }
      });

      await User.findByIdAndUpdate(friendRequest.recipient._id, {
        $addToSet: { friends: friendRequest.sender._id }
      });

      // Notify sender
      const senderSocket = getUserSocket(friendRequest.sender._id);
      if (senderSocket) {
        senderSocket.emit('friend request accepted', {
          friendRequest,
          newFriend: friendRequest.recipient
        });
      }

      // Auto-create private conversation
      const conversation = await Conversation.findOrCreatePrivate(
        friendRequest.sender._id,
        friendRequest.recipient._id
      );

      callback({ 
        success: true, 
        friendRequest,
        conversation,
        newFriend: friendRequest.sender
      });
    } catch (error) {
      console.error('Accept friend request error:', error);
      callback({ success: false, message: error.message });
    }
  });

  socket.on('reject friend request', async (data, callback) => {
    try {
      const { requestId } = data;

      const friendRequest = await FriendRequest.rejectRequest(requestId, userId);
      await friendRequest.populate([
        { path: 'sender', select: 'username email avatar profilePicture' },
        { path: 'recipient', select: 'username email avatar profilePicture' }
      ]);

      // Notify sender
      const senderSocket = getUserSocket(friendRequest.sender._id);
      if (senderSocket) {
        senderSocket.emit('friend request rejected', friendRequest);
      }

      callback({ success: true, friendRequest });
    } catch (error) {
      console.error('Reject friend request error:', error);
      callback({ success: false, message: error.message });
    }
  });

  socket.on('remove friend', async (data, callback) => {
    try {
      const { friendId } = data;

      // Remove from both users' friends lists
      await User.findByIdAndUpdate(userId, {
        $pull: { friends: friendId }
      });

      await User.findByIdAndUpdate(friendId, {
        $pull: { friends: userId }
      });

      // Notify the other user
      const friendSocket = getUserSocket(friendId);
      if (friendSocket) {
        friendSocket.emit('friend removed', { userId });
      }

      callback({ success: true, message: 'Friend removed' });
    } catch (error) {
      console.error('Remove friend error:', error);
      callback({ success: false, message: error.message });
    }
  });

  // ----- MESSAGE REACTIONS -----

  socket.on('add reaction', async (data, callback) => {
    try {
      const { messageId, emoji } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        return callback({ success: false, message: 'Message not found' });
      }

      await message.addReaction(userId, emoji);
      await message.populate('reactions.user', 'username');

      // Emit to conversation
      io.to(message.conversationId.toString()).emit('message reaction', {
        messageId,
        reactions: message.reactions
      });

      callback({ success: true });
    } catch (error) {
      console.error('Add reaction error:', error);
      callback({ success: false, message: error.message });
    }
  });

  socket.on('remove reaction', async (data, callback) => {
    try {
      const { messageId } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        return callback({ success: false, message: 'Message not found' });
      }

      await message.removeReaction(userId);

      // Emit to conversation
      io.to(message.conversationId.toString()).emit('message reaction', {
        messageId,
        reactions: message.reactions
      });

      callback({ success: true });
    } catch (error) {
      console.error('Remove reaction error:', error);
      callback({ success: false, message: error.message });
    }
  });

  // ----- UNREAD COUNT -----

  socket.on('get unread counts', async (callback) => {
    try {
      const conversations = await Conversation.find({ participants: userId });
      const unreadCounts = {};

      for (const conv of conversations) {
        const count = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        });
        unreadCounts[conv._id] = count;
      }

      callback({ success: true, unreadCounts });
    } catch (error) {
      console.error('Get unread counts error:', error);
      callback({ success: false, message: error.message });
    }
  });

  socket.on('mark as read', async (data) => {
    try {
      const { conversationId } = data;

      // Mark all unread messages as read
      await Message.updateMany(
        {
          conversationId,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        },
        {
          $push: {
            readBy: {
              user: userId,
              readAt: Date.now()
            }
          }
        }
      );

      // Notify others in conversation
      socket.to(conversationId).emit('messages read', {
        conversationId,
        userId,
        readAt: Date.now()
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });

  // ----- DISCONNECT -----

  socket.on('disconnect', async (reason) => {
    console.log(`❌ User disconnected: ${socket.user.username} (${reason})`);

    userSockets.delete(userId);
    socketUsers.delete(socket.id);

    // Update user status
    await User.findByIdAndUpdate(userId, {
      status: 'offline',
      lastSeen: Date.now()
    });

    // Notify friends only (not everyone)
    emitToFriends(userId, 'user status', {
      userId,
      status: 'offline',
      lastSeen: Date.now()
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
