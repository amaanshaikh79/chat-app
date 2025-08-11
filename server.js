const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

let users = {};

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('user-joined', username);
    });

    socket.on('message', (data) => {
        socket.broadcast.emit('message', data);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit('user-left', username);
            delete users[socket.id];
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
});
