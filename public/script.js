(() => {
  const socket = (typeof io === 'function') ? io() : null;

  // DOM
  const usernameInput = document.getElementById('username');
  const joinBtn = document.getElementById('join-btn');
  const messagesEl = document.getElementById('messages');
  const messageInput = document.getElementById('message');
  const sendForm = document.getElementById('send-form');
  const sendBtn = document.getElementById('send-btn');
  const typingEl = document.getElementById('typing-indicator');
  const usersListEl = document.getElementById('users-list');

  // state
  let username = localStorage.getItem('apnaChat_username') || '';
  let typing = false;
  let lastTypingTime = 0;
  const TYPING_TIMER_LENGTH = 700;
  let activeTypers = new Set();
  let isWindowFocused = true;

  // lightweight sound
  const msgSound = (() => {
    try {
      const a = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=");
      a.volume = 0.25;
      return a;
    } catch (e) { return null; }
  })();

  if (username) {
    usernameInput.value = username;
    enableChatUI();
  }

  // helper
  function formatTime(ts = Date.now()) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${hh}:${mm}`;
  }

  function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  function createSystem(text){
    const el = document.createElement('div');
    el.className = 'message system';
    el.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
    messagesEl.appendChild(el);
    scrollSmart();
  }

  function appendMessage({id, user, text, time, self=false, status='delivered'}) {
    const el = document.createElement('div');
    el.className = `message ${self ? 'self' : 'other'}`;
    el.dataset.msgId = id || '';
    el.innerHTML = `
      <div class="meta"><span class="user">${escapeHtml(user)}</span><span class="time">${formatTime(time)}</span></div>
      <div class="bubble">${escapeHtml(text)}</div>
      <div class="status">${status === 'sending' ? 'Sending…' : (status === 'delivered' ? '✓' : '')}</div>
    `;
    messagesEl.appendChild(el);
    scrollSmart();
  }

  function scrollSmart(){
    const threshold = 120;
    const nearBottom = (messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight) < threshold;
    if (nearBottom) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function enableChatUI(){
    messageInput.removeAttribute('disabled');
    sendBtn.removeAttribute('disabled');
    usernameInput.setAttribute('disabled','true');
    joinBtn.setAttribute('disabled','true');
    messageInput.focus();
  }

  // typing
  function updateTyping(){
    if (!socket || !socket.connected) return;
    if (!typing){
      typing = true;
      socket.emit('typing', { user: username });
    }
    lastTypingTime = Date.now();
    setTimeout(() => {
      const diff = Date.now() - lastTypingTime;
      if (diff >= TYPING_TIMER_LENGTH && typing){
        typing = false;
        socket.emit('stop typing', { user: username });
      }
    }, TYPING_TIMER_LENGTH + 50);
  }

  // desktop notifications
  function showNotification(title, body){
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") new Notification(title, { body });
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(p => { if (p === "granted") new Notification(title, { body }); });
    }
  }

  // events
  joinBtn.addEventListener('click', () => {
    const val = usernameInput.value.trim();
    if (!val) { usernameInput.focus(); return; }
    username = val;
    localStorage.setItem('apnaChat_username', username);
    if (socket) socket.emit('join', { user: username });
    createSystem(`Tumne join kar liya — ${username}`);
    enableChatUI();
  });
  usernameInput.addEventListener('keydown', e => { if (e.key === 'Enter') joinBtn.click(); });

  messageInput.addEventListener('input', () => updateTyping());

  sendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    const tmpId = 'tmp-' + Date.now() + '-' + Math.random().toString(36).slice(2,7);
    appendMessage({ id: tmpId, user: username, text, time: Date.now(), self: true, status: 'sending' });
    messageInput.value = '';
    if (typing){ typing = false; socket && socket.emit('stop typing', { user: username }); }
    socket && socket.emit('chat message', { id: tmpId, user: username, text, time: Date.now() });
  });

  window.addEventListener('focus', () => isWindowFocused = true);
  window.addEventListener('blur', () => isWindowFocused = false);

  // socket handling
  if (!socket){
    createSystem('Socket.io client nahi mila — realtime features disabled.');
  } else {
    socket.on('connect', () => {
      createSystem('Server se connected.');
      if (username) socket.emit('join', { user: username });
    });

    socket.on('disconnect', () => createSystem('Server se disconnect ho gaya. Reconnecting...'));

    // server emits full message (we used io.emit so sender also receives it)
    socket.on('message', (data) => {
      // try to find optimistic message
      const existing = messagesEl.querySelector(`.message[data-msg-id="${data.id}"]`);
      if (existing) {
        existing.classList.remove('self');
        const st = existing.querySelector('.status');
        if (st) st.textContent = '✓';
        const t = existing.querySelector('.time');
        if (t) t.textContent = formatTime(data.time || Date.now());
        return;
      }
      const fromMe = data.user === username;
      appendMessage({ id: data.id, user: data.user, text: data.text, time: data.time, self: fromMe, status: 'delivered' });
      if (!fromMe){
        if (!isWindowFocused) showNotification(`${data.user}`, data.text.slice(0,100));
        if (msgSound) try{ msgSound.play().catch(()=>{}); } catch(e){}
      }
    });

    socket.on('message delivered', (payload) => {
      if (payload && payload.id){
        const el = messagesEl.querySelector(`.message[data-msg-id="${payload.id}"]`);
        if (el) el.querySelector('.status').textContent = '✓';
      }
    });

    // typing
    socket.on('typing', (payload) => {
      if (!payload || !payload.user) return;
      if (payload.user === username) return;
      activeTypers.add(payload.user);
      renderTyping();
    });
    socket.on('stop typing', (payload) => {
      if (!payload || !payload.user) return;
      activeTypers.delete(payload.user);
      renderTyping();
    });

    function renderTyping(){
      if (activeTypers.size === 0){
        typingEl.textContent = '';
        typingEl.setAttribute('aria-hidden','true');
      } else {
        const arr = Array.from(activeTypers).slice(0,3);
        typingEl.textContent = arr.join(', ') + (activeTypers.size > 3 ? ' aur others...' : '') + ' type kar rahe hain...';
        typingEl.setAttribute('aria-hidden','false');
      }
    }

    // user join/left
    socket.on('user joined', (payload) => {
      const u = payload && payload.user ? payload.user : 'Koi';
      createSystem(`${u} joined the chat.`);
      if (!isWindowFocused) showNotification('Join', `${u} joined`);
    });

    socket.on('user left', (payload) => {
      const u = payload && payload.user ? payload.user : 'Koi';
      createSystem(`${u} left the chat.`);
    });

    // user list
    socket.on('user list', (arr) => {
      const users = Array.isArray(arr) ? arr : (arr && arr.users ? arr.users : []);
      usersListEl.innerHTML = '';
      users.forEach(u => {
        const li = document.createElement('li');
        li.textContent = u;
        if (u === username) li.classList.add('you');
        usersListEl.appendChild(li);
      });
    });

    // forced logout (duplicate login)
    socket.on('force logout', (payload) => {
      createSystem('Aapka session kisi naye login ne replace kar diya — aap disconnect ho gaye.');
      // disable UI
      usernameInput.removeAttribute('disabled');
      joinBtn.removeAttribute('disabled');
      messageInput.setAttribute('disabled','true');
      sendBtn.setAttribute('disabled','true');
      localStorage.removeItem('apnaChat_username');
      // attempt to disconnect socket
      try { socket.disconnect(); } catch(e){}
    });

    socket.on('join error', (payload) => {
      createSystem('Join error: ' + (payload && payload.message ? payload.message : 'Unknown'));
    });

  } // socket exists end

})();
