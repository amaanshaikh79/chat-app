const socket = io();

const usernameInput = document.getElementById('username');
const joinBtn = document.getElementById('join-btn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');

let username = '';

// Chat join karne ka button
joinBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('join', username);
        usernameInput.disabled = true;
        joinBtn.disabled = true;
        messageInput.disabled = false;
        sendBtn.disabled = false;
        addMessage('System', `Aap chat mein shamil ho gaye!`, 'system');
    }
});

// Message bhejne ka button
sendBtn.addEventListener('click', sendMessage);

// Enter key se message bhejna
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', { user: username, text: message });
        addMessage(username, message, 'self');
        messageInput.value = '';
    }
}

// Server se message receive karna
socket.on('message', (data) => {
    addMessage(data.user, data.text, 'other');
});

// New user join karne par notification
socket.on('user-joined', (name) => {
    addMessage('System', `${name} chat mein aaya hai!`, 'system');
});

// User leave karne par notification
socket.on('user-left', (name) => {
    addMessage('System', `${name} chat chhod kar chala gaya.`, 'system');
});

// Message display karne ka function
function addMessage(user, text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}