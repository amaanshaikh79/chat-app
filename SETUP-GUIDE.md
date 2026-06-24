# 🚀 Complete Setup Guide - Apna Chat App

## Quick Start (Step-by-Step)

### Step 1: Install MongoDB

#### Option A: MongoDB Community Server (Recommended)
1. Download MongoDB: https://www.mongodb.com/try/download/community
2. Choose your Windows version
3. Run installer (accept defaults)
4. MongoDB Compass will also be installed (GUI tool)

#### Option B: Using Chocolatey (if installed)
```bash
choco install mongodb
```

### Step 2: Start MongoDB

#### Method 1: Windows Service (Automatic)
MongoDB installs as a Windows service and starts automatically.

#### Method 2: Manual Start
Open Command Prompt as Administrator:
```bash
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

Keep this terminal open while using the app.

### Step 3: Verify MongoDB is Running

Open a new terminal:
```bash
# Try connecting
mongosh
```

If you see MongoDB shell, it's working! Type `exit` to quit.

### Step 4: Start Chat App

In the chat-app directory:
```bash
npm start
```

You should see:
```
✅ MongoDB connected: localhost
🚀 Server chal raha hai: http://localhost:3000
```

### Step 5: Open Browser

Navigate to: **http://localhost:3000**

## 🧪 Testing Checklist

### ✅ Test 1: User Authentication
1. ☐ Open http://localhost:3000
2. ☐ Click "Signup Karo"
3. ☐ Create account with:
   - Username: testuser1
   - Email: test1@test.com
   - Password: test123
4. ☐ Should automatically login and show chat screen
5. ☐ See your username in top-right corner

### ✅ Test 2: Message Persistence
1. ☐ Send a message in Global Chat
2. ☐ Click Logout button
3. ☐ Login again with same credentials
4. ☐ Your previous message should still be there! ✨

### ✅ Test 3: Private Messaging
1. ☐ Open a second browser (or incognito window)
2. ☐ Create second account:
   - Username: testuser2
   - Email: test2@test.com
   - Password: test123
3. ☐ In testuser1's window, click ➕ button (New DM)
4. ☐ Search for "testuser2"
5. ☐ Click on testuser2 to start DM
6. ☐ Send message: "Hello from DM!"
7. ☐ In testuser2's window, click "Direct Messages" tab
8. ☐ Should see conversation with testuser1
9. ☐ Click conversation and reply

### ✅ Test 4: Message Edit
1. ☐ Send a message: "This is a tets"
2. ☐ Right-click on your message
3. ☐ Click "✏️ Edit"
4. ☐ Fix to: "This is a test"
5. ☐ Click Save
6. ☐ Message should update with "(edited)" label

### ✅ Test 5: Message Delete
1. ☐ Send a message: "Delete me"
2. ☐ Right-click on your message
3. ☐ Click "🗑️ Delete"
4. ☐ Confirm deletion
5. ☐ Message should disappear from chat

### ✅ Test 6: Real-time Features
1. ☐ With two users logged in
2. ☐ Start typing in one window
3. ☐ Other window should show "username typing..."
4. ☐ Send message from first user
5. ☐ Should appear instantly in second user's window
6. ☐ Check online users list updates in real-time

### ✅ Test 7: Persistence After Refresh
1. ☐ Send several messages in Global Chat
2. ☐ Create a DM conversation
3. ☐ Send messages in DM
4. ☐ Press F5 to refresh browser
5. ☐ After auto-login:
   - ☐ Global chat messages still there
   - ☐ DM conversation still in list
   - ☐ Click DM, messages still there

## 🐛 Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
mongod --dbpath C:\data\db
```

### Issue: "Port 3000 already in use"
**Solution:**
Edit `.env` file:
```
PORT=3001
```
Then visit http://localhost:3001

### Issue: "Authentication failed" after refresh
**Solution:**
- Clear browser cache and localStorage
- Or use Incognito mode
- Delete token and login again

### Issue: Can't edit/delete messages
**Solution:**
- Can only edit within 15 minutes
- Can only edit/delete YOUR OWN messages
- Check if you're logged in correctly

### Issue: Messages not showing after refresh
**Solution:**
1. Check MongoDB is running
2. Check server logs for errors
3. Try: `npm start` again
4. Check browser console (F12) for errors

### Issue: Real-time not working
**Solution:**
1. Check Socket.IO connection in browser console
2. Look for connection errors
3. Verify token is valid (re-login)
4. Check firewall isn't blocking WebSocket

## 📊 Database Structure

After testing, check your MongoDB:

```bash
mongosh
use chat-app
show collections
```

You should see:
- `users` - All registered users
- `messages` - All messages (global + DMs)
- `conversations` - All conversations (global + private)

### View Data:
```javascript
// See all users
db.users.find().pretty()

// See all messages
db.messages.find().pretty()

// See all conversations
db.conversations.find().pretty()

// Count messages
db.messages.countDocuments()
```

## 🎯 Feature Verification

| Feature | Status | Test |
|---------|--------|------|
| User Signup | ✅ | Create new account |
| User Login | ✅ | Login with credentials |
| JWT Auth | ✅ | Token stored in localStorage |
| Global Chat | ✅ | Send/receive messages |
| Message Persistence | ✅ | Refresh browser, messages stay |
| Private Messaging | ✅ | DM another user |
| Message Edit | ✅ | Right-click → Edit |
| Message Delete | ✅ | Right-click → Delete |
| Typing Indicator | ✅ | See "typing..." |
| Online Status | ✅ | See online users |
| Real-time Sync | ✅ | Instant message delivery |
| Auto-reconnect | ✅ | Reconnects on disconnect |

## 🔐 Security Testing

### Test Password Hashing:
```javascript
// In MongoDB shell
use chat-app
db.users.findOne()
```
Password should be a long hashed string (bcrypt), NOT plain text!

### Test JWT:
Open browser console (F12):
```javascript
localStorage.getItem('chatToken')
```
Should see a JWT token (3 parts separated by dots).

### Test Duplicate Session:
1. Login with user1 in Browser A
2. Login with same user1 in Browser B
3. Browser A should get "force logout" message

## 🎉 Success Criteria

You've successfully completed Priority 1 features if:

✅ **Message Persistence**: Messages survive refresh  
✅ **Authentication**: Secure login/signup works  
✅ **Private Messaging**: Can DM specific users  
✅ **Edit/Delete**: Can modify your messages  

## 📸 What You Should See

### Login Screen:
- Beautiful gradient background with bubbles
- Login and Signup forms
- Clean, modern design

### Chat Screen:
- Left sidebar: Conversations (Global + DMs)
- Center: Chat messages with timestamps
- Right sidebar: Online users
- Bottom: Message input with typing indicator

### Message Features:
- Your messages on right (blue)
- Others' messages on left (gray)
- Right-click your messages for menu
- "(edited)" label on edited messages

## 🚀 Next Steps

After successful testing:
1. Customize styling in `public/style.css`
2. Add user avatars
3. Implement file uploads
4. Add group chat UI
5. Deploy to production (Heroku, Railway, etc.)

## 💡 Pro Tips

1. **Use MongoDB Compass** - Visual tool to see your data
2. **Browser DevTools** - F12 to see console logs
3. **Multiple Browsers** - Test real-time features
4. **Incognito Mode** - Test multiple users easily

---

## ❓ Need Help?

Check server logs for errors:
```bash
npm start
# Watch for error messages
```

Check browser console:
- Press F12
- Go to Console tab
- Look for red error messages

---

**Happy Testing! 🎉**
