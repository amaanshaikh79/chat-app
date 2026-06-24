# 🚀 Quick Start Guide - Premium Chat App

## Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection URI
- Git (optional)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Make sure your `.env` file has these variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### 3. Start the Server

```bash
npm start
```

The app will run at: **http://localhost:3000**

---

## First Time Setup

### Create Your First Account

1. Open **http://localhost:3000** in your browser
2. Click **"Create Account"**
3. Fill in:
   - Username (min 3 characters)
   - Email
   - Password (min 6 characters)
4. Click **"Sign Up"**

### Testing with Multiple Users

To test the real-time features, open the app in 2+ browser windows:

1. **Window 1**: Create Account → User A
2. **Window 2**: Create Account → User B (use incognito/private mode)
3. **Window 3**: Create Account → User C (use different browser)

---

## Feature Walkthrough

### 1. Send a Friend Request

1. Go to **🔍 Discover** tab
2. Search for a username or see all users
3. Click **➕ Add** button
4. Wait for them to accept

### 2. Accept Friend Request

1. Go to **👥 Friends** tab
2. See the **Friend Requests** section at top
3. Click **✓** to accept or **✕** to reject

### 3. Start Chatting

1. Go to **💬 Chats** tab
2. Click on any friend or Global Chat
3. Type a message and press **Send 🚀**

### 4. Try Advanced Features

- **React to messages**: Double-click any message
- **Edit your messages**: Right-click → Edit (within 15 min)
- **Add emojis**: Click 😊 button in input bar
- **Change theme**: Click Profile → Select theme
- **See online status**: Green dot = online

---

## Mobile Testing

### Desktop Browser
1. Press `F12` to open DevTools
2. Click the device icon (responsive mode)
3. Select a mobile device (iPhone, Android)
4. Reload the page

### Actual Mobile Device
1. Find your computer's local IP:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
2. On mobile, open: `http://YOUR_IP:3000`
3. Make sure mobile is on same WiFi network

---

## Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
# Change PORT in .env to another port like 3001
PORT=3001
```

### MongoDB Connection Error
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or check your MongoDB Atlas connection string
```

### Socket.IO Not Connecting
- Check browser console for errors
- Make sure no firewall is blocking the connection
- Try a different browser

### Messages Not Appearing
1. Check browser console
2. Refresh the page
3. Verify JWT token in localStorage
4. Check server logs

---

## Default Features Available

✅ **Global Chat** - Chat with everyone  
✅ **Private DMs** - One-on-one conversations  
✅ **Friend System** - Add/remove friends  
✅ **Real-time Typing** - See when others are typing  
✅ **Read Receipts** - ✓ Sent, ✓✓ Delivered, ✓✓ Read  
✅ **Online Status** - Green dot for online users  
✅ **Last Seen** - "Last seen 5m ago"  
✅ **Message Reactions** - ❤️ 👍 😂 and more  
✅ **Edit/Delete** - Edit within 15 min  
✅ **Emoji Picker** - 300+ emojis  
✅ **Themes** - Dark, Darker, OLED  
✅ **Mobile Support** - Full responsive design  
✅ **Notifications** - Toast messages + sounds  

---

## Testing Checklist

- [ ] Create 2+ accounts
- [ ] Send/accept friend requests
- [ ] Send messages in Global Chat
- [ ] Start a private DM
- [ ] Test typing indicators
- [ ] Add reactions to messages
- [ ] Edit a message (right-click)
- [ ] Delete a message
- [ ] Change theme in Profile
- [ ] Test on mobile (responsive mode)
- [ ] Check online/offline status updates
- [ ] Verify read receipts (✓✓)
- [ ] Test emoji picker
- [ ] Check unread badges

---

## Need Help?

Check the full feature list: `FEATURES.md`

**Enjoy your premium chat experience! 💬✨**
