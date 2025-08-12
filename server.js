const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

let users = {}; // socket.id -> username

function broadcastUserList() {
    io.emit('user list', Object.values(users));
}

io.on('connection', (socket) => {

    socket.on('join', (data) => {
        const username = (data && data.user) ? data.user : data; // support string or object
        users[socket.id] = username;

        socket.broadcast.emit('user joined', { user: username });
        broadcastUserList();
    });

    socket.on('chat message', (msg) => {
        // msg expected: { id, user, text, time }
        socket.broadcast.emit('message', msg);
        // Acknowledge to sender (delivery confirmation)
        socket.emit('message delivered', { id: msg.id });
    });

    // Typing events
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('stop typing', (data) => {
        socket.broadcast.emit('stop typing', data);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit('user left', { user: username });
            delete users[socket.id];
            broadcastUserList();
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
});
