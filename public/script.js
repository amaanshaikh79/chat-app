// script.js (safe, ready-to-paste)
const socket = io();

const usernameInput = document.getElementById('username');
const joinBtn = document.getElementById('join-btn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');
const sendForm = document.getElementById('send-form');

let username = null;

// Helper to safely escape text
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Add message to DOM
// type: 'self' | 'other' | 'system'
function addMessage(user, text, type = 'other', meta = '') {
  const el = document.createElement('div');
  el.classList.add('message', type);

  if (type === 'system') {
    el.innerHTML = `${escapeHtml(text)}`;
  } else {
    // show "Name: message"
    const namePart = `<strong>${escapeHtml(user)}:</strong> `;
    el.innerHTML = `${namePart}${escapeHtml(text)}`;
  }

  if (meta) {
    const metaEl = document.createElement('div');
    metaEl.className = 'msg-meta';
    metaEl.textContent = meta;
    el.appendChild(metaEl);
  }

  messagesDiv.appendChild(el);
  // scroll to bottom
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Join button
joinBtn.addEventListener('click', () => {
  const val = usernameInput.value.trim();
  if (!val) return;
  username = val;
  socket.emit('join', username);

  // disable inputs
  usernameInput.disabled = true;
  joinBtn.disabled = true;
  messageInput.disabled = false;
  sendBtn.disabled = false;

  addMessage('System', `🎉 ${username}, aap chat me shamil ho gaye!`, 'system');
  messageInput.focus();
});

// Send message (form submit)
sendForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg || !username) return;

  // add locally as self
  addMessage(username, msg, 'self');

  // emit to server
  socket.emit('message', { user: username, text: msg });

  messageInput.value = '';
  messageInput.focus();
}

// Receive broadcasted message from server
// Server sends { user, text }
socket.on('message', (data) => {
  // If message is from current user, don't treat as other (prevent duplicate)
  // but here server broadcasts only to others so this condition is safe,
  // we keep the check to be robust if server behavior changes.
  if (!data || !data.user) return;

  if (username && data.user === username) {
    // if server accidentally sent back to sender, show as self (idempotent)
    addMessage(data.user, data.text, 'self');
  } else {
    addMessage(data.user, data.text, 'other');
  }
});

// User joined notification
socket.on('user-joined', (name) => {
  addMessage('System', `🚀 ${name} chat mein aaya hai!`, 'system');
});

// User left notification
socket.on('user-left', (name) => {
  addMessage('System', `👋 ${name} chat chhod ke gaya.`, 'system');
});
