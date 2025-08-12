const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  // optional configs
  pingTimeout: 60000,
});

app.use(express.static('public'));

// maps
const usersBySocket = new Map();   // socketId -> username
const socketByUser = new Map();    // username -> socketId

function broadcastUserList() {
  const users = Array.from(socketByUser.keys());
  io.emit('user list', users);
}

io.on('connection', (socket) => {
  console.log('New socket connected', socket.id);

  socket.on('join', (data) => {
    const username = (data && data.user) ? data.user.trim() : (typeof data === 'string' ? data.trim() : 'Unknown');

    if (!username) {
      socket.emit('join error', { message: 'Invalid username' });
      return;
    }

    // If existing socket for same username, disconnect old socket (force single session)
    if (socketByUser.has(username)) {
      const oldSocketId = socketByUser.get(username);
      if (oldSocketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          // ask old socket to logout (optional) then disconnect
          oldSocket.emit('force logout', { reason: 'duplicate_login' });
          try { oldSocket.disconnect(true); } catch(e) {}
          usersBySocket.delete(oldSocketId);
        }
      }
    }

    // register this socket
    usersBySocket.set(socket.id, username);
    socketByUser.set(username, socket.id);

    // notify others
    socket.broadcast.emit('user joined', { user: username });
    broadcastUserList();

    console.log(`${username} joined (${socket.id})`);
  });

  socket.on('chat message', (msg) => {
    // ensure structure
    const out = {
      id: msg.id || (`srv-${Date.now()}-${Math.random().toString(36).slice(2,6)}`),
      user: msg.user || usersBySocket.get(socket.id) || 'Unknown',
      text: String(msg.text || ''),
      time: msg.time || Date.now(),
    };
    // emit to all (including sender) so everyone has consistent flow
    io.emit('message', out);

    // optionally confirm to sender (not necessary if sender receives 'message', but keep explicit)
    socket.emit('message delivered', { id: out.id });
  });

  socket.on('typing', (payload) => {
    const user = payload && payload.user ? payload.user : usersBySocket.get(socket.id);
    if (!user) return;
    socket.broadcast.emit('typing', { user });
  });

  socket.on('stop typing', (payload) => {
    const user = payload && payload.user ? payload.user : usersBySocket.get(socket.id);
    if (!user) return;
    socket.broadcast.emit('stop typing', { user });
  });

  socket.on('disconnect', (reason) => {
    const username = usersBySocket.get(socket.id);
    if (username) {
      usersBySocket.delete(socket.id);
      // only delete mapping if this socket was the registered socket for the username
      const currentId = socketByUser.get(username);
      if (currentId === socket.id) socketByUser.delete(username);

      socket.broadcast.emit('user left', { user: username });
      broadcastUserList();
      console.log(`${username} disconnected (${socket.id}) reason: ${reason}`);
    } else {
      console.log('Socket disconnected (no username)', socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`));
