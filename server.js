const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.broadcast.emit('user-joined', username);
    });

    socket.on('message', (data) => {
        socket.broadcast.emit('message', data);
    });

    socket.on('disconnect', () => {
        // Agar aap chahein toh user leave ka bhi track kar sakte ho
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server chal raha hai http://localhost:${PORT}`);
});