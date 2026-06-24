# 💬 Apna Chat App

Full-featured real-time chat application with authentication, message persistence, private messaging, and message editing.

## ✨ Features

### 🎯 Priority 1 Features (Implemented)
- **Message History & Persistence** - MongoDB se messages save hote hain, refresh karne par bhi milte hain
- **User Authentication** - JWT-based login/signup system with secure password hashing
- **Private Messaging (DM)** - User-to-user direct messaging, WhatsApp/Telegram jaisa
- **Message Edit & Delete** - Galat messages ko edit ya delete kar sakte ho (15 min window)

### 🔥 Additional Features
- Global chat room for all users
- Real-time typing indicators
- Online/offline user status
- Message timestamps
- Conversation management
- User search for starting DMs
- Responsive design (mobile-friendly)
- Beautiful gradient UI with animations

## 🚀 Setup Instructions

### Prerequisites
1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup MongoDB**
   - Start MongoDB server on your machine
   - Default connection: `mongodb://localhost:27017/chat-app`
   - Or update `MONGODB_URI` in `.env` file

3. **Configure Environment**
   - Copy `.env.example` to `.env` (already done)
   - Update environment variables if needed:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/chat-app
     JWT_SECRET=apna-secret-key-2024-chat-app-secure
     JWT_EXPIRE=7d
     ```

4. **Start Server**
   ```bash
   npm start
   ```

5. **Open Browser**
   - Navigate to: `http://localhost:3000`
   - Create an account and start chatting!

## 📱 Usage Guide

### First Time Setup
1. Open `http://localhost:3000`
2. Click "Signup Karo" 
3. Enter username, email, and password (min 6 characters)
4. Automatically logged in after signup

### Chatting
- **Global Chat**: Default room where all users can chat
- **Direct Messages**: Click ➕ button to search users and start DM
- **Send Message**: Type and press Enter or click Send
- **Edit Message**: Right-click your message → Edit (within 15 minutes)
- **Delete Message**: Right-click your message → Delete

### Navigation
- **Global Chat Tab**: See all users chatting together
- **Direct Messages Tab**: View your private conversations
- **Online Users Panel**: See who's currently online (right sidebar)

## 🗂️ Project Structure

```
chat-app/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User schema with password hashing
│   ├── Message.js           # Message schema with edit/delete
│   └── Conversation.js      # Conversation schema (private/group)
├── routes/
│   ├── auth.js              # Authentication routes (login/signup)
│   ├── users.js             # User management routes
│   ├── conversations.js     # Conversation management
│   └── messages.js          # Message CRUD operations
├── public/
│   ├── index.html           # Frontend HTML
│   ├── script.js            # Frontend JavaScript (Socket.io client)
│   └── style.css            # Modern gradient styling
├── server.js                # Main server with Socket.io
├── package.json             # Dependencies
├── .env                     # Environment variables
└── README.md                # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (with optional search)
- `GET /api/users/:userId` - Get user by ID

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations/private` - Create/get private conversation
- `POST /api/conversations/group` - Create group conversation
- `GET /api/conversations/:id` - Get specific conversation

### Messages
- `GET /api/messages/:conversationId` - Get messages (with pagination)
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message

## 🔌 Socket.IO Events

### Client → Server
- `join global` - Join global chat room
- `join private` - Join/create private conversation
- `send message` - Send a message
- `edit message` - Edit existing message
- `delete message` - Delete message
- `typing` - User is typing
- `stop typing` - User stopped typing

### Server → Client
- `message` - New message received
- `message edited` - Message was edited
- `message deleted` - Message was deleted
- `typing` - Someone is typing
- `stop typing` - Someone stopped typing
- `user joined` - User joined chat
- `user left` - User left chat
- `user status` - User status changed
- `force logout` - Duplicate session detected

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt (10 rounds)
- **JWT Tokens**: Secure authentication with 7-day expiry
- **Socket Authentication**: Token verification on connection
- **Input Validation**: Server-side validation for all inputs
- **XSS Prevention**: HTML escaping on frontend
- **Session Management**: Single session per user (duplicate logout)

## 🎨 Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Modern CSS with gradients and animations

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/chat-app |
| `JWT_SECRET` | Secret key for JWT signing | (set in .env) |
| `JWT_EXPIRE` | JWT token expiration | 7d |
| `NODE_ENV` | Environment mode | development |

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Try: `mongodb://127.0.0.1:27017/chat-app`

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop other process using port 3000

### Authentication Errors
- Clear browser localStorage
- Check JWT_SECRET is set in `.env`
- Verify token expiration time

### Messages Not Persisting
- Verify MongoDB is running and connected
- Check server logs for database errors
- Ensure models are properly initialized

## 🚧 Known Limitations

- **Edit Window**: Messages can only be edited within 15 minutes
- **File Uploads**: Not yet implemented
- **Message Read Receipts**: UI not fully implemented
- **Group Chats**: Backend ready, UI pending

## 🔮 Future Enhancements

- File and image sharing
- Voice messages
- Video calling
- Message reactions (emoji)
- Read receipts UI
- Full group chat UI
- User profiles with avatars
- Push notifications
- Message search
- Dark/light theme toggle

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ for learning and fun!

---

**Happy Chatting! 💬🎉**
