const socket = io();

const usernameInput = document.getElementById('username');
const joinBtn = document.getElementById('join-btn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');

let username = '';

joinBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('join', username);
        usernameInput.disabled = true;
        joinBtn.disabled = true;
        messageInput.disabled = false;
        sendBtn.disabled = false;
        addMessage('System', `🎉 ${username}, aap chat me shamil ho gaye!`, 'system');
    }
});

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', { user: username, text: message });
        addMessage(username, message, 'self');
        messageInput.value = '';
    }
}

socket.on('message', (data) => {
    addMessage(data.user, data.text, 'other');
});

socket.on('user-joined', (name) => {
    addMessage('System', `🚀 ${name} chat mein aaya hai!`, 'system');
});

socket.on('user-left', (name) => {
    addMessage('System', `👋 ${name} chat chhod ke gaya.`, 'system');
});

function addMessage(user, text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerHTML = `<strong>${user}:</strong> ${text}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
