/*  Replace your existing script.js with this.
    Assumptions about server events (standard, but check your server):
      - client emits: 'join', 'chat message', 'typing', 'stop typing'
      - server emits: 'message' (for broadcasted messages), 'user joined', 'user left', 'typing', 'stop typing', 'user list'
    If your server uses other event names, tell me and I'll adapt.
*/

(() => {
  const socket = (typeof io === 'function') ? io() : null;

  // DOM refs
  const usernameInput = document.getElementById('username');
  const joinBtn = document.getElementById('join-btn');
  const messagesEl = document.getElementById('messages');
  const messageInput = document.getElementById('message');
  const sendForm = document.getElementById('send-form');
  const sendBtn = document.getElementById('send-btn');

  // Create extra UI: typing indicator, users panel
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.setAttribute('aria-hidden', 'true');
  typingIndicator.textContent = ''; // will be updated
  messagesEl.parentNode.insertBefore(typingIndicator, messagesEl.nextSibling);

  const usersPanel = document.createElement('aside');
  usersPanel.className = 'users-panel';
  usersPanel.innerHTML = `<h3>Active Users</h3><ul class="users-list" aria-live="polite"></ul>`;
  document.querySelector('.chat-card').insertBefore(usersPanel, document.querySelector('.chat-card').firstChild);

  const usersListEl = usersPanel.querySelector('.users-list');

  // State
  let username = localStorage.getItem('apnaChat_username') || '';
  let typing = false;
  let lastTypingTime = 0;
  const TYPING_TIMER_LENGTH = 700; // ms
  let isWindowFocused = true;

  // small sound on incoming messages
  const msgSound = (() => {
    try {
      const audio = new Audio();
      // simple beep using data URI to avoid external files
      audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
      audio.volume = 0.25;
      return audio;
    } catch (e) {
      return null;
    }
  })();

  // Attach saved username to input
  if (username) {
    usernameInput.value = username;
    enableChatAfterJoinUI();
  }

  // Utils
  function formatTime(ts = Date.now()) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function createSystemMessage(text) {
    const el = document.createElement('div');
    el.className = 'message system';
    el.innerHTML = `<span class="sys-text">${escapeHtml(text)}</span><span class="time">${formatTime()}</span>`;
    messagesEl.appendChild(el);
    smartScroll();
  }

  function appendMessage({id, user, text, time, self=false, status='delivered'}) {
    const el = document.createElement('div');
    el.className = `message ${self ? 'self' : 'other'}`;
    el.dataset.msgId = id || '';
    const who = escapeHtml(user || 'Unknown');
    const body = escapeHtml(text || '');
    const tm = formatTime(time || Date.now());
    el.innerHTML = `
      <div class="meta">
        <strong class="user">${who}</strong>
        <span class="time">${tm}</span>
      </div>
      <div class="bubble">${body}</div>
      <div class="status">${status === 'sending' ? 'Sending…' : (status === 'delivered' ? '✓' : '')}</div>
    `;
    messagesEl.appendChild(el);
    smartScroll();
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function smartScroll() {
    // if user is near bottom -> scroll to bottom
    const threshold = 100;
    const nearBottom = (messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight) < threshold;
    if (nearBottom) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function enableChatAfterJoinUI() {
    messageInput.removeAttribute('disabled');
    sendBtn.removeAttribute('disabled');
    usernameInput.setAttribute('disabled','true');
    joinBtn.setAttribute('disabled','true');
    messageInput.focus();
  }

  // Typing handlers (debounced)
  function updateTyping() {
    if (!socket || !socket.connected) return;
    if (!typing) {
      typing = true;
      socket.emit('typing', { user: username });
    }
    lastTypingTime = Date.now();

    setTimeout(() => {
      const timeDiff = Date.now() - lastTypingTime;
      if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
        socket.emit('stop typing', { user: username });
        typing = false;
      }
    }, TYPING_TIMER_LENGTH + 50);
  }

  // Desktop notification
  function showDesktopNotification(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") new Notification(title, { body });
      });
    }
  }

  // Event listeners
  joinBtn.addEventListener('click', () => {
    const val = usernameInput.value.trim();
    if (!val) {
      usernameInput.focus();
      return;
    }
    username = val;
    localStorage.setItem('apnaChat_username', username);
    if (socket) {
      socket.emit('join', { user: username });
    }
    createSystemMessage(`Tumne join kar liya — ${username}`);
    enableChatAfterJoinUI();
  });

  usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinBtn.click();
  });

  messageInput.addEventListener('input', () => {
    updateTyping();
  });

  sendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    const tempId = 'tmp-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
    // optimistic append
    appendMessage({ id: tempId, user: username, text, time: Date.now(), self: true, status: 'sending' });
    messageInput.value = '';
    socket && socket.emit('chat message', { id: tempId, user: username, text, time: Date.now() });
    // stop typing immediately
    if (typing) {
      typing = false;
      socket && socket.emit('stop typing', { user: username });
    }
  });

  // focus tracking for notifications
  window.addEventListener('focus', () => isWindowFocused = true);
  window.addEventListener('blur', () => isWindowFocused = false);

  // If socket not available, show offline notice
  if (!socket) {
    createSystemMessage('Socket.io client not found. Real-time features disabled.');
  } else {
    socket.on('connect', () => {
      createSystemMessage('Server se connected.');
      // re-join if we had a name
      if (username) {
        socket.emit('join', { user: username });
      }
    });

    socket.on('disconnect', () => {
      createSystemMessage('Server se disconnected. Reconnecting...');
    });

    // incoming message from server
    socket.on('message', (data) => {
      // data expected: { id, user, text, time }
      const fromMe = data.user === username;
      // find optimistic message by tmp id and mark delivered
      if (data.id) {
        const match = messagesEl.querySelector(`.message[data-msg-id="${data.id}"]`);
        if (match) {
          match.classList.remove('self', 'sending');
          match.querySelector('.status').textContent = '✓';
          // update time if necessary
          const tspan = match.querySelector('.time');
          if (tspan) tspan.textContent = formatTime(data.time || Date.now());
          return; // optimistic update done
        }
      }
      appendMessage({ id: data.id, user: data.user, text: data.text, time: data.time, self: fromMe, status: 'delivered' });

      // show sound/notification only if from others
      if (!fromMe) {
        if (!isWindowFocused) showDesktopNotification(`${data.user}`, data.text.slice(0, 100));
        if (msgSound) try { msgSound.play().catch(()=>{}); } catch(e){}
      }
    });

    // typing events
    // payload: { user }
    const activeTypers = new Set();
    socket.on('typing', (payload) => {
      if (!payload || !payload.user) return;
      if (payload.user === username) return;
      activeTypers.add(payload.user);
      renderTypingIndicator();
    });
    socket.on('stop typing', (payload) => {
      if (!payload || !payload.user) return;
      activeTypers.delete(payload.user);
      renderTypingIndicator();
    });

    function renderTypingIndicator() {
      if (activeTypers.size === 0) {
        typingIndicator.textContent = '';
        typingIndicator.setAttribute('aria-hidden','true');
      } else {
        const names = Array.from(activeTypers).slice(0,3);
        const text = names.join(', ') + (activeTypers.size > 3 ? ' aur others...' : '') + ' type kar rahe hain...';
        typingIndicator.textContent = text;
        typingIndicator.setAttribute('aria-hidden','false');
      }
    }

    // user join/leave
    socket.on('user joined', (payload) => {
      const user = payload && payload.user ? payload.user : 'Koi';
      createSystemMessage(`${user} joined the chat.`);
      // show desktop notification if background
      if (!isWindowFocused) showDesktopNotification('Join', `${user} joined the chat.`);
    });

    socket.on('user left', (payload) => {
      const user = payload && payload.user ? payload.user : 'Koi';
      createSystemMessage(`${user} left the chat.`);
    });

    // user list update
    // server may emit 'user list' with array of names
    socket.on('user list', (payload) => {
      // payload expected: { users: ['a', 'b', ...] } or array directly
      const arr = Array.isArray(payload) ? payload : (payload && payload.users ? payload.users : []);
      usersListEl.innerHTML = '';
      arr.forEach(u => {
        const li = document.createElement('li');
        li.textContent = u;
        if (u === username) li.className = 'you';
        usersListEl.appendChild(li);
      });
    });

    // fallback server broadcasts
    // some servers might emit 'chat message' directly
    socket.on('chat message', (d) => {
      // handle similar to 'message'
      socket.emit && socket.emit('noop'); // no-op if needed
      // reuse 'message' handler logic: convert and call append
      appendMessage({ id: d.id, user: d.user, text: d.text, time: d.time, self: d.user === username, status: 'delivered' });
    });

    // server may acknowledge message delivered via 'message delivered'
    socket.on('message delivered', (payload) => {
      // payload expected: { id }
      if (payload && payload.id) {
        const el = messagesEl.querySelector(`.message[data-msg-id="${payload.id}"]`);
        if (el) el.querySelector('.status').textContent = '✓';
      }
    });

  } // end if socket exists

  // initial system hint
  (function initialHint(){
    const sys = messagesEl.querySelector('.message.system');
    if (!sys) {
      createSystemMessage('⚡ Pehle apna naam daalo aur join karo!');
    }
  })();

})();
