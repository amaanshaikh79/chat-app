// ========== PREMIUM CHAT APP - MAIN SCRIPT ==========
(() => {
  'use strict';

  const API_BASE = window.location.origin;
  const TYPING_TIMER_LENGTH = 700;
  const EMOJI_LIST = ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤝','💪','🙏','✍️','💅','🤳','💃','🕺','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾️','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥','🕦','🕧','🏳️','🏴','🏴‍☠️','🏁','🚩','🏳️‍🌈','🇺🇳'];

  // ========== DOM ELEMENTS ==========
  // Auth
  const authScreen = document.getElementById('auth-screen');
  const chatScreen = document.getElementById('chat-screen');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const logoutBtn = document.getElementById('logout-btn');
  
  // Chat UI
  const messagesEl = document.getElementById('messages');
  const messageInput = document.getElementById('message-input');
  const sendForm = document.getElementById('send-form');
  const sendBtn = document.getElementById('send-btn');
  const typingEl = document.getElementById('typing-indicator');
  const currentUserEl = document.getElementById('current-user');
  const chatTitleEl = document.getElementById('chat-title');
  const chatSubtitleEl = document.getElementById('chat-subtitle');
  const chatAvatarEl = document.getElementById('chat-avatar');
  const onlineCountEl = document.getElementById('online-count');
  
  // Sidebar & Tabs
  const sidebar = document.getElementById('sidebar');
  const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
  const conversationsList = document.getElementById('conversations-list');
  const friendsList = document.getElementById('friends-list');
  const discoverUsersList = document.getElementById('discover-users-list');
  const userSearchInput = document.getElementById('user-search');
  const friendRequestsSection = document.getElementById('friend-requests-section');
  const friendRequestsList = document.getElementById('friend-requests-list');
  const requestsBadge = document.getElementById('requests-badge');
  const noFriends = document.getElementById('no-friends');
  const noUsers = document.getElementById('no-users');
  
  // Mobile
  const mobileNav = document.getElementById('mobile-nav');
  const mobileBackBtn = document.getElementById('mobile-back-btn');
  const chatMain = document.getElementById('chat-main');
  
  // Modals & Menus
  const profileModal = document.getElementById('profile-modal');
  const profileBtn = document.getElementById('profile-btn');
  const editModal = document.getElementById('edit-modal');
  const messageMenu = document.getElementById('message-menu');
  const reactMenu = document.getElementById('react-menu');
  const emojiPicker = document.getElementById('emoji-picker');
  const emojiBtn = document.getElementById('emoji-btn');
  const emojiGrid = document.getElementById('emoji-grid');
  const notificationBell = document.getElementById('notification-bell');
  const notificationBadge = document.getElementById('notification-badge');
  const toastContainer = document.getElementById('toast-container');

  // ========== STATE ==========
  let socket = null;
  let token = localStorage.getItem('chatToken');
  let currentUser = null;
  let currentConversation = null;
  let conversations = new Map();
  let friends = new Map();
  let friendRequests = { incoming: [], outgoing: [] };
  let onlineUsers = new Set();
  let onlinePresence = new Set(); // ids of users currently online (live presence)
  let typing = false;
  let lastTypingTime = 0;
  let activeTypers = new Set();
  let editingMessageId = null;
  let isMobile = window.innerWidth <= 768;
  let currentMobileView = 'sidebar'; // 'sidebar' or 'chat'
  
  // Settings
  const settings = {
    theme: localStorage.getItem('theme') || 'dark',
    notificationSound: localStorage.getItem('notificationSound') !== 'false'
  };

  // ========== INITIALIZATION ==========
  if (token) {
    verifyTokenAndConnect();
  } else {
    showAuthScreen();
  }

  // Initialize emoji picker
  initEmojiPicker();
  
  // Apply saved theme
  applyTheme(settings.theme);
  
  // Mobile detection: when crossing the breakpoint, re-sync which pane is shown.
  window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    if (wasMobile !== isMobile) syncMobileLayout();
  });

  // On mobile the sidebar and chat pane are mutually exclusive and toggled with
  // the .mobile-active class; without this the page would be blank on load.
  // On desktop both panes are shown by the grid, so the classes are cleared.
  function syncMobileLayout() {
    if (isMobile) {
      if (currentMobileView === 'chat') {
        showChatMobile();
      } else {
        showSidebarMobile();
      }
    } else {
      sidebar.classList.remove('mobile-active');
      chatMain.classList.remove('mobile-active');
      mobileBackBtn.classList.remove('visible');
    }
  }

  // ========== AUTH FUNCTIONS ==========
  async function verifyTokenAndConnect() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        connectSocket();
        showChatScreen();
      } else {
        localStorage.removeItem('chatToken');
        token = null;
        showAuthScreen();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    authScreen.style.display = 'flex';
    chatScreen.style.display = 'none';
  }

  function showChatScreen() {
    authScreen.style.display = 'none';
    chatScreen.style.display = 'block';
    currentUserEl.textContent = `👤 ${currentUser.username}`;
    syncMobileLayout();
    loadInitialData();
  }

  // Form switching
  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
    clearErrors();
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
    clearErrors();
  });

  function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
  }

  // Login
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (!email || !password) {
      errorEl.textContent = 'Email and password are required!';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Loading...';

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('chatToken', token);
        connectSocket();
        showChatScreen();
        showToast('Welcome back!', 'success');
      } else {
        errorEl.textContent = data.message || 'Login failed';
      }
    } catch (error) {
      errorEl.textContent = 'Server error. Please try again.';
      console.error('Login error:', error);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });

  // Signup
  signupBtn.addEventListener('click', async () => {
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errorEl = document.getElementById('signup-error');

    if (!username || !email || !password) {
      errorEl.textContent = 'All fields are required!';
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters!';
      return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating...';

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('chatToken', token);
        connectSocket();
        showChatScreen();
        showToast('Account created successfully!', 'success');
      } else {
        errorEl.textContent = data.message || 'Signup failed';
      }
    } catch (error) {
      errorEl.textContent = 'Server error. Please try again.';
      console.error('Signup error:', error);
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    if (socket) socket.disconnect();
    localStorage.removeItem('chatToken');
    token = null;
    currentUser = null;
    showAuthScreen();
    showToast('Logged out successfully', 'info');
  });

  // Enter key handlers
  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  document.getElementById('signup-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') signupBtn.click();
  });

  // ========== SOCKET CONNECTION ==========
  function connectSocket() {
    if (!token) return;

    socket = io({
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      showToast('Disconnected from server. Reconnecting...', 'error');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      if (error.message.includes('Authentication')) {
        localStorage.removeItem('chatToken');
        token = null;
        showAuthScreen();
        showToast('Session expired. Please login again.', 'error');
      }
    });

    socket.on('force logout', (data) => {
      showToast('Your session was replaced by a new login.', 'info');
      setTimeout(() => {
        if (socket) socket.disconnect();
        localStorage.removeItem('chatToken');
        token = null;
        showAuthScreen();
      }, 2000);
    });

    // Message events
    socket.on('message', handleNewMessage);
    socket.on('message edited', handleMessageEdited);
    socket.on('message deleted', handleMessageDeleted);
    socket.on('message reaction', handleMessageReaction);
    socket.on('messages read', handleMessagesRead);

    // Typing events
    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    // User events
    socket.on('user status', handleUserStatus);

    // Friend events
    socket.on('friend request received', handleFriendRequestReceived);
    socket.on('friend request accepted', handleFriendRequestAccepted);
    socket.on('friend request rejected', handleFriendRequestRejected);
    socket.on('friend removed', handleFriendRemoved);
  }

  // ========== LOAD INITIAL DATA ==========
  async function loadInitialData() {
    await Promise.all([
      joinGlobalChat(),
      loadConversations(),
      loadFriends(),
      loadFriendRequests(),
      loadUsers()
    ]);
  }

  async function joinGlobalChat() {
    socket.emit('join global', (response) => {
      if (response.success) {
        currentConversation = {
          _id: response.conversationId,
          type: 'global',
          name: 'Global Chat'
        };
        conversations.set(response.conversationId, currentConversation);
        displayMessages(response.messages);
        seedPresence(response.onlineUsers);
        refreshGlobalOnlineCount();
      }
    });
  }

  async function loadConversations() {
    try {
      const response = await fetch(`${API_BASE}/api/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        data.conversations.forEach(conv => {
          if (conv.type === 'private') {
            conversations.set(conv._id, conv);
            addConversationToList(conv);
          }
        });
      }
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  }

  async function loadFriends() {
    try {
      const response = await fetch(`${API_BASE}/api/friends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        friends.clear();
        data.friends.forEach(friend => {
          friends.set(friend._id, friend);
        });
        seedPresence(data.friends);
        displayFriends(data.friends);
        refreshGlobalOnlineCount();
      }
    } catch (error) {
      console.error('Load friends error:', error);
    }
  }

  async function loadFriendRequests() {
    try {
      const response = await fetch(`${API_BASE}/api/friends/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        friendRequests = data;
        displayFriendRequests(data.incoming);
        updateNotificationBadge();
      }
    } catch (error) {
      console.error('Load friend requests error:', error);
    }
  }

  async function loadUsers(search = '') {
    try {
      const url = search 
        ? `${API_BASE}/api/users?search=${encodeURIComponent(search)}`
        : `${API_BASE}/api/users`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        displayDiscoverUsers(data.users);
      }
    } catch (error) {
      console.error('Load users error:', error);
    }
  }

  // ========== TAB SWITCHING ==========
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  function switchTab(tab) {
    // Update button states
    tabBtns.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');

    // Load data if needed
    if (tab === 'discover' && discoverUsersList.children.length === 0) {
      loadUsers();
    }
  }

  // Mobile navigation
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      
      // Update active state
      document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      if (nav === 'profile') {
        openProfileModal();
      } else {
        switchTab(nav);
        showSidebarMobile();
      }
    });
  });

  mobileBackBtn.addEventListener('click', () => {
    showSidebarMobile();
  });

  function showSidebarMobile() {
    if (!isMobile) return;
    sidebar.classList.add('mobile-active');
    chatMain.classList.remove('mobile-active');
    mobileBackBtn.classList.remove('visible');
    currentMobileView = 'sidebar';
  }

  function showChatMobile() {
    if (!isMobile) return;
    sidebar.classList.remove('mobile-active');
    chatMain.classList.add('mobile-active');
    mobileBackBtn.classList.add('visible');
    currentMobileView = 'chat';
  }

  // ========== CONVERSATIONS ==========
  function addConversationToList(conv) {
    const otherUser = conv.participants?.find(p => p._id !== currentUser._id);
    if (!otherUser) return;

    const existing = conversationsList.querySelector(`[data-conv-id="${conv._id}"]`);
    if (existing) {
      existing.remove();
    }

    const convItem = document.createElement('div');
    convItem.className = 'conversation-item';
    convItem.dataset.convId = conv._id;
    convItem.dataset.convType = 'private';
    convItem.dataset.userId = otherUser._id;

    const isOnline = onlinePresence.has(otherUser._id) || friends.get(otherUser._id)?.status === 'online';
    const avatarBg = otherUser.profilePicture || '#7C3AED';
    const initials = otherUser.username.substring(0, 2).toUpperCase();

    convItem.innerHTML = `
      <div class="avatar ${isOnline ? 'online' : ''}" style="background: ${avatarBg};">${initials}</div>
      <div class="item-details">
        <div class="item-name">${escapeHtml(otherUser.username)}</div>
        <div class="item-preview">Click to chat</div>
      </div>
      <div class="item-meta">
        <span class="unread-badge hidden">0</span>
      </div>
    `;

    convItem.addEventListener('click', () => switchToConversation(conv._id));
    conversationsList.appendChild(convItem);
  }

  async function switchToConversation(convId) {
    const conv = conversations.get(convId);
    if (!conv) return;

    // Update active state
    document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
    const convEl = conversationsList.querySelector(`[data-conv-id="${convId}"]`);
    if (convEl) convEl.classList.add('active');

    // Clear messages
    messagesEl.innerHTML = '';
    activeTypers.clear();
    renderTyping();

    currentConversation = conv;

    if (conv.type === 'global') {
      chatTitleEl.textContent = 'Global Chat';
      chatSubtitleEl.textContent = '';
      chatAvatarEl.innerHTML = '🌍';
      chatAvatarEl.style.background = 'linear-gradient(135deg, #14B8A6, #10B981)';
      socket.emit('join global', (response) => {
        if (response.success) {
          displayMessages(response.messages);
          updateOnlineCount(response.onlineUsers?.length || 0);
        }
      });
    } else {
      const otherUser = conv.participants.find(p => p._id !== currentUser._id);
      const friend = friends.get(otherUser._id);
      
      chatTitleEl.textContent = otherUser.username;
      const isOnline = friend?.status === 'online';
      chatSubtitleEl.textContent = isOnline ? 'Online' : `Last seen ${formatLastSeen(friend?.lastSeen)}`;
      chatSubtitleEl.className = isOnline ? 'chat-subtitle online' : 'chat-subtitle';
      
      const avatarBg = otherUser.profilePicture || '#7C3AED';
      const initials = otherUser.username.substring(0, 2).toUpperCase();
      chatAvatarEl.innerHTML = initials;
      chatAvatarEl.style.background = avatarBg;
      chatAvatarEl.className = isOnline ? 'avatar online' : 'avatar';
      
      onlineCountEl.textContent = '';

      socket.emit('join private', { recipientId: otherUser._id }, (response) => {
        if (response.success) {
          displayMessages(response.messages);
          // Mark as read
          socket.emit('mark as read', { conversationId: convId });
        }
      });
    }

    showChatMobile();
  }

  // ========== FRIENDS ==========
  function displayFriends(friendsArray) {
    friendsList.innerHTML = '';
    
    if (friendsArray.length === 0) {
      noFriends.classList.remove('hidden');
      return;
    }
    
    noFriends.classList.add('hidden');

    friendsArray.forEach(friend => {
      const friendItem = document.createElement('div');
      friendItem.className = 'friend-item';
      friendItem.dataset.userId = friend._id;

      const isOnline = onlinePresence.has(friend._id) || friend.status === 'online';
      const avatarBg = friend.profilePicture || '#7C3AED';
      const initials = friend.username.substring(0, 2).toUpperCase();

      friendItem.innerHTML = `
        <div class="avatar ${isOnline ? 'online' : ''}" style="background: ${avatarBg};">${initials}</div>
        <div class="item-details">
          <div class="item-name">${escapeHtml(friend.username)}</div>
          <div class="item-preview">${isOnline ? 'Online' : `Last seen ${formatLastSeen(friend.lastSeen)}`}</div>
        </div>
      `;

      friendItem.addEventListener('click', () => startChatWithFriend(friend));
      friendsList.appendChild(friendItem);
    });
  }

  async function startChatWithFriend(friend) {
    try {
      const response = await fetch(`${API_BASE}/api/conversations/private`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: friend._id })
      });

      if (response.ok) {
        const data = await response.json();
        conversations.set(data.conversation._id, data.conversation);
        addConversationToList(data.conversation);
        
        // Switch to chats tab
        switchTab('chats');
        
        // Switch to conversation
        switchToConversation(data.conversation._id);
      }
    } catch (error) {
      console.error('Start chat error:', error);
      showToast('Failed to start chat', 'error');
    }
  }

  // ========== FRIEND REQUESTS ==========
  function displayFriendRequests(requests) {
    friendRequestsList.innerHTML = '';
    
    if (requests.length === 0) {
      friendRequestsSection.classList.add('hidden');
      return;
    }
    
    friendRequestsSection.classList.remove('hidden');
    requestsBadge.textContent = requests.length;

    requests.forEach(request => {
      const requestItem = document.createElement('div');
      requestItem.className = 'friend-request-item';
      requestItem.dataset.requestId = request._id;

      const sender = request.sender;
      const avatarBg = sender.profilePicture || '#7C3AED';
      const initials = sender.username.substring(0, 2).toUpperCase();

      requestItem.innerHTML = `
        <div class="avatar" style="background: ${avatarBg};">${initials}</div>
        <div class="item-details">
          <div class="item-name">${escapeHtml(sender.username)}</div>
        </div>
        <div class="friend-request-actions">
          <button class="accept-btn" onclick="acceptFriendRequest('${request._id}')">✓</button>
          <button class="reject-btn" onclick="rejectFriendRequest('${request._id}')">✕</button>
        </div>
      `;

      friendRequestsList.appendChild(requestItem);
    });
  }

  window.acceptFriendRequest = function(requestId) {
    socket.emit('accept friend request', { requestId }, (response) => {
      if (response.success) {
        showToast(`You are now friends with ${response.newFriend.username}!`, 'success');
        loadFriendRequests();
        loadFriends();
      } else {
        showToast(response.message || 'Failed to accept request', 'error');
      }
    });
  };

  window.rejectFriendRequest = function(requestId) {
    socket.emit('reject friend request', { requestId }, (response) => {
      if (response.success) {
        showToast('Friend request rejected', 'info');
        loadFriendRequests();
      } else {
        showToast(response.message || 'Failed to reject request', 'error');
      }
    });
  };

  // ========== DISCOVER USERS ==========
  function displayDiscoverUsers(users) {
    discoverUsersList.innerHTML = '';
    seedPresence(users);

    // Filter out self and already friends
    const filteredUsers = users.filter(u =>
      u._id !== currentUser._id && !friends.has(u._id)
    );
    
    if (filteredUsers.length === 0) {
      noUsers.classList.remove('hidden');
      return;
    }
    
    noUsers.classList.add('hidden');

    filteredUsers.forEach(user => {
      const userItem = document.createElement('div');
      userItem.className = 'user-item';
      userItem.dataset.userId = user._id;

      const avatarBg = user.profilePicture || '#7C3AED';
      const initials = user.username.substring(0, 2).toUpperCase();
      const isOnline = onlinePresence.has(user._id) || user.status === 'online';

      // Check if request already sent
      const requestSent = friendRequests.outgoing.some(r => r.recipient._id === user._id);

      userItem.innerHTML = `
        <div class="avatar ${isOnline ? 'online' : ''}" style="background: ${avatarBg};">${initials}</div>
        <div class="item-details">
          <div class="item-name">${escapeHtml(user.username)}</div>
          <div class="item-preview">${isOnline ? 'Online' : 'Offline'}</div>
        </div>
        <button class="add-friend-btn ${requestSent ? 'pending' : ''}" 
                onclick="sendFriendRequest('${user._id}')"
                ${requestSent ? 'disabled' : ''}>
          ${requestSent ? '⏳ Pending' : '➕ Add'}
        </button>
      `;

      discoverUsersList.appendChild(userItem);
    });
  }

  window.sendFriendRequest = function(recipientId) {
    socket.emit('friend request', { recipientId }, (response) => {
      if (response.success) {
        showToast('Friend request sent!', 'success');
        loadFriendRequests();
        loadUsers(userSearchInput.value.trim());
      } else {
        showToast(response.message || 'Failed to send request', 'error');
      }
    });
  };

  userSearchInput.addEventListener('input', (e) => {
    const search = e.target.value.trim();
    loadUsers(search);
  });

  // ========== MESSAGES ==========
  function displayMessages(messages) {
    messagesEl.innerHTML = '';
    messages.forEach(msg => appendMessage(msg, false));
    scrollToBottom();
  }

  function appendMessage(msg, animate = true) {
    if (!msg || !msg.sender) return;

    const isSelf = msg.sender._id === currentUser._id;
    const msgEl = document.createElement('div');
    msgEl.className = `message ${isSelf ? 'self' : 'other'}`;
    msgEl.dataset.msgId = msg._id;
    if (!animate) msgEl.style.animation = 'none';

    if (msg.messageType === 'system') {
      msgEl.className = 'message system';
      msgEl.innerHTML = `<div class="bubble">${escapeHtml(msg.text)}</div>`;
      messagesEl.appendChild(msgEl);
      scrollSmart();
      return;
    }

    const time = formatTime(msg.createdAt);
    const editedLabel = msg.isEdited ? '<span class="edited-label">(edited)</span>' : '';
    const statusIcon = isSelf ? getStatusIcon(msg.status) : '';

    const avatarBg = msg.sender.profilePicture || '#7C3AED';
    const initials = msg.sender.username.substring(0, 2).toUpperCase();

    msgEl.innerHTML = `
      <div class="meta">
        <span class="user">${escapeHtml(msg.sender.username)}</span>
        <span class="time">${time}${editedLabel}${statusIcon}</span>
      </div>
      <div class="bubble">${escapeHtml(msg.text)}</div>
      ${msg.reactions?.length > 0 ? renderReactions(msg.reactions) : ''}
    `;

    // Context menu for own messages
    if (isSelf) {
      msgEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showMessageMenu(e, msg);
      });
    }

    // Double click to react
    msgEl.addEventListener('dblclick', (e) => {
      showReactMenu(e, msg);
    });

    messagesEl.appendChild(msgEl);
    scrollSmart();
  }

  function getStatusIcon(status) {
    if (!status) return '';
    if (status === 'sent') return ' <span class="status-icon">✓</span>';
    if (status === 'delivered') return ' <span class="status-icon">✓✓</span>';
    if (status === 'read') return ' <span class="status-icon" style="color: var(--accent);">✓✓</span>';
    return '';
  }

  function renderReactions(reactions) {
    if (!reactions || reactions.length === 0) return '';
    
    const reactionCounts = {};
    reactions.forEach(r => {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
    });

    const html = Object.entries(reactionCounts).map(([emoji, count]) => 
      `<span class="reaction">${emoji} ${count}</span>`
    ).join('');

    return `<div class="message-reactions">${html}</div>`;
  }

  function handleNewMessage(data) {
    // Reconcile the optimistic placeholder the sender saw before the server
    // echoed the saved message back (keyed by tempId, not the real _id).
    if (data.tempId) {
      const optimistic = messagesEl.querySelector(`[data-msg-id="${data.tempId}"]`);
      if (optimistic) optimistic.remove();
    }

    // Never render the same message twice.
    if (messagesEl.querySelector(`[data-msg-id="${data._id}"]`)) return;

    // If the message belongs to another conversation, surface it without
    // rendering it in the open thread.
    if (!currentConversation || String(data.conversationId) !== String(currentConversation._id)) {
      if (!conversations.has(data.conversationId)) {
        // A message for a conversation we have not loaded yet (e.g. a brand new
        // DM started by the other person) — refresh the list so it appears.
        loadConversations();
      }
      updateConversationUnread(data.conversationId);
      return;
    }

    appendMessage(data);

    // For messages from others, play a sound and mark the thread as read.
    if (data.sender._id !== currentUser._id) {
      playMessageSound();
      socket.emit('mark as read', { conversationId: data.conversationId });
    }
  }

  function handleMessageEdited(msg) {
    const msgEl = messagesEl.querySelector(`[data-msg-id="${msg._id}"]`);
    if (!msgEl) return;

    const bubble = msgEl.querySelector('.bubble');
    const time = msgEl.querySelector('.time');
    
    bubble.textContent = msg.text;
    const statusIcon = msg.sender._id === currentUser._id ? getStatusIcon(msg.status) : '';
    time.innerHTML = `${formatTime(msg.createdAt)}<span class="edited-label">(edited)</span>${statusIcon}`;
  }

  function handleMessageDeleted(data) {
    const msgEl = messagesEl.querySelector(`[data-msg-id="${data.messageId}"]`);
    if (msgEl) {
      msgEl.classList.add('deleting');
      setTimeout(() => msgEl.remove(), 300);
    }
  }

  function handleMessageReaction(data) {
    const msgEl = messagesEl.querySelector(`[data-msg-id="${data.messageId}"]`);
    if (!msgEl) return;

    const existingReactions = msgEl.querySelector('.message-reactions');
    if (existingReactions) existingReactions.remove();

    if (data.reactions?.length > 0) {
      const bubble = msgEl.querySelector('.bubble');
      bubble.insertAdjacentHTML('afterend', renderReactions(data.reactions));
    }
  }

  function handleMessagesRead(data) {
    // Update message status icons
    messagesEl.querySelectorAll('.message.self').forEach(msgEl => {
      const time = msgEl.querySelector('.time');
      if (time) {
        const statusSpan = time.querySelector('.status-icon');
        if (statusSpan) {
          statusSpan.style.color = 'var(--accent)';
          statusSpan.textContent = '✓✓';
        }
      }
    });
  }

  // Send message
  sendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !currentConversation) return;

    const tempId = 'temp-' + Date.now();
    
    // Optimistic update
    appendMessage({
      _id: tempId,
      sender: currentUser,
      text,
      createdAt: new Date(),
      isEdited: false,
      status: 'sent'
    });

    // Add sending animation
    sendBtn.classList.add('sending');
    setTimeout(() => sendBtn.classList.remove('sending'), 300);

    socket.emit('send message', {
      conversationId: currentConversation._id,
      text,
      tempId
    }, (response) => {
      if (!response.success) {
        console.error('Send message failed:', response.message);
        const msgEl = messagesEl.querySelector(`[data-msg-id="${tempId}"]`);
        if (msgEl) msgEl.remove();
        showToast('Failed to send message', 'error');
      }
    });

    messageInput.value = '';
    if (typing) {
      typing = false;
      socket.emit('stop typing', { conversationId: currentConversation._id });
    }
  });

  // Typing indicator
  messageInput.addEventListener('input', () => {
    if (!currentConversation) return;
    updateTyping();
  });

  function updateTyping() {
    if (!typing) {
      typing = true;
      socket.emit('typing', { conversationId: currentConversation._id });
    }
    lastTypingTime = Date.now();
    setTimeout(() => {
      const diff = Date.now() - lastTypingTime;
      if (diff >= TYPING_TIMER_LENGTH && typing) {
        typing = false;
        socket.emit('stop typing', { conversationId: currentConversation._id });
      }
    }, TYPING_TIMER_LENGTH + 50);
  }

  function handleTyping(data) {
    if (data.conversationId !== currentConversation?._id) return;
    activeTypers.add(data.username);
    renderTyping();
  }

  function handleStopTyping(data) {
    if (data.conversationId !== currentConversation?._id) return;
    activeTypers.delete(data.username);
    renderTyping();
  }

  function renderTyping() {
    if (activeTypers.size === 0) {
      typingEl.textContent = '';
      typingEl.setAttribute('aria-hidden', 'true');
    } else {
      const arr = Array.from(activeTypers).slice(0, 3);
      const dots = '<span class="typing-dots"><span></span><span></span><span></span></span>';
      typingEl.innerHTML = `${arr.join(', ')} typing${dots}`;
      typingEl.setAttribute('aria-hidden', 'false');
    }
  }

  // ========== MESSAGE ACTIONS ==========
  function showMessageMenu(e, msg) {
    messageMenu.classList.remove('hidden');
    messageMenu.style.left = e.pageX + 'px';
    messageMenu.style.top = e.pageY + 'px';
    messageMenu.dataset.msgId = msg._id;
    messageMenu.dataset.msgText = msg.text;
  }

  function showReactMenu(e, msg) {
    reactMenu.classList.remove('hidden');
    reactMenu.style.left = e.pageX + 'px';
    reactMenu.style.top = e.pageY + 'px';
    reactMenu.dataset.msgId = msg._id;
  }

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!messageMenu.contains(e.target)) {
      messageMenu.classList.add('hidden');
    }
    if (!reactMenu.contains(e.target)) {
      reactMenu.classList.add('hidden');
    }
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
      emojiPicker.classList.add('hidden');
    }
  });

  messageMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const action = e.target.dataset.action;
    const msgId = messageMenu.dataset.msgId;
    const msgText = messageMenu.dataset.msgText;

    if (action === 'edit') {
      openEditModal(msgId, msgText);
    } else if (action === 'delete') {
      deleteMessage(msgId);
    } else if (action === 'react') {
      showReactMenu(e, { _id: msgId });
    }

    messageMenu.classList.add('hidden');
  });

  reactMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    const emoji = e.target.dataset.emoji;
    const msgId = reactMenu.dataset.msgId;

    if (emoji && msgId) {
      addReaction(msgId, emoji);
    }

    reactMenu.classList.add('hidden');
  });

  function addReaction(messageId, emoji) {
    socket.emit('add reaction', { messageId, emoji }, (response) => {
      if (!response.success) {
        showToast(response.message || 'Failed to add reaction', 'error');
      }
    });
  }

  // Edit message
  function openEditModal(msgId, msgText) {
    editingMessageId = msgId;
    document.getElementById('edit-textarea').value = msgText;
    editModal.classList.remove('hidden');
    document.getElementById('edit-textarea').focus();
  }

  function closeEditModal() {
    editModal.classList.add('hidden');
    editingMessageId = null;
    document.getElementById('edit-textarea').value = '';
  }

  document.getElementById('edit-modal-close').addEventListener('click', closeEditModal);
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);

  document.getElementById('save-edit').addEventListener('click', () => {
    const newText = document.getElementById('edit-textarea').value.trim();
    if (!newText || !editingMessageId) return;

    socket.emit('edit message', {
      messageId: editingMessageId,
      text: newText
    }, (response) => {
      if (response.success) {
        closeEditModal();
      } else {
        showToast(response.message || 'Failed to edit message', 'error');
      }
    });
  });

  // Delete message
  function deleteMessage(msgId) {
    if (!confirm('Delete this message?')) return;

    socket.emit('delete message', { messageId: msgId }, (response) => {
      if (!response.success) {
        showToast(response.message || 'Failed to delete message', 'error');
      }
    });
  }

  // ========== EMOJI PICKER ==========
  function initEmojiPicker() {
    EMOJI_LIST.forEach(emoji => {
      const emojiItem = document.createElement('div');
      emojiItem.className = 'emoji-item';
      emojiItem.textContent = emoji;
      emojiItem.addEventListener('click', () => {
        messageInput.value += emoji;
        messageInput.focus();
        emojiPicker.classList.add('hidden');
      });
      emojiGrid.appendChild(emojiItem);
    });
  }

  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('hidden');
  });

  // ========== PROFILE MODAL ==========
  profileBtn.addEventListener('click', () => {
    openProfileModal();
  });

  function openProfileModal() {
    // Populate with current user data
    document.getElementById('profile-username').value = currentUser.username;
    document.getElementById('profile-bio').value = currentUser.bio || '';
    document.getElementById('notification-sound-toggle').checked = settings.notificationSound;
    
    const avatarBg = currentUser.profilePicture || '#7C3AED';
    const initials = currentUser.username.substring(0, 2).toUpperCase();
    document.getElementById('profile-avatar-display').style.background = avatarBg;
    document.getElementById('profile-avatar-display').textContent = initials;
    document.getElementById('profile-username-display').textContent = currentUser.username;

    // Set active theme
    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === settings.theme);
    });

    profileModal.classList.remove('hidden');
  }

  function closeProfileModal() {
    profileModal.classList.add('hidden');
  }

  document.getElementById('profile-modal-close').addEventListener('click', closeProfileModal);
  document.getElementById('profile-cancel').addEventListener('click', closeProfileModal);

  document.getElementById('profile-save').addEventListener('click', async () => {
    const username = document.getElementById('profile-username').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const notificationSound = document.getElementById('notification-sound-toggle').checked;

    if (!username) {
      showToast('Username is required', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, bio })
      });

      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        currentUserEl.textContent = `👤 ${currentUser.username}`;
        
        // Save settings
        settings.notificationSound = notificationSound;
        localStorage.setItem('notificationSound', notificationSound);
        
        closeProfileModal();
        showToast('Profile updated successfully!', 'success');
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      showToast('Failed to update profile', 'error');
    }
  });

  // Theme selector
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      settings.theme = theme;
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      
      document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'darker') {
      root.style.setProperty('--surface-1', 'hsl(230, 30%, 6%)');
      root.style.setProperty('--surface-2', 'hsl(230, 28%, 9%)');
      root.style.setProperty('--surface-3', 'hsl(230, 26%, 12%)');
    } else if (theme === 'oled') {
      root.style.setProperty('--surface-1', '#000000');
      root.style.setProperty('--surface-2', '#0a0a0a');
      root.style.setProperty('--surface-3', '#121212');
    } else {
      root.style.setProperty('--surface-1', 'hsl(230, 25%, 10%)');
      root.style.setProperty('--surface-2', 'hsl(230, 22%, 14%)');
      root.style.setProperty('--surface-3', 'hsl(230, 20%, 18%)');
    }
  }

  // ========== FRIEND EVENTS ==========
  function handleFriendRequestReceived(data) {
    showToast(`${data.sender.username} sent you a friend request`, 'info');
    loadFriendRequests();
    updateNotificationBadge();
  }

  function handleFriendRequestAccepted(data) {
    showToast(`${data.newFriend.username} accepted your friend request!`, 'success');
    loadFriends();
    loadFriendRequests();
  }

  function handleFriendRequestRejected(data) {
    loadFriendRequests();
  }

  function handleFriendRemoved(data) {
    friends.delete(data.userId);
    loadFriends();
    showToast('A friend removed you', 'info');
  }

  function handleUserStatus(data) {
    if (!data || !data.userId || data.userId === currentUser?._id) return;

    const online = data.status === 'online';
    if (online) onlinePresence.add(data.userId);
    else onlinePresence.delete(data.userId);

    applyPresence(data.userId, online, data.lastSeen);
    refreshGlobalOnlineCount();
  }

  // Reflect a single user's presence everywhere it is shown: the Friends,
  // Discover and Chats lists (all keyed by data-user-id) and the chat header.
  function applyPresence(userId, online, lastSeen) {
    const friend = friends.get(userId);
    if (friend) {
      friend.status = online ? 'online' : 'offline';
      friend.lastSeen = lastSeen;
    }

    const previewText = online ? 'Online' : `Last seen ${formatLastSeen(lastSeen)}`;

    document.querySelectorAll(`[data-user-id="${userId}"]`).forEach((item) => {
      const avatar = item.querySelector('.avatar');
      if (avatar) avatar.classList.toggle('online', online);
      const preview = item.querySelector('.item-preview');
      if (preview) preview.textContent = previewText;
    });

    // Update the chat header when the open conversation is with this user.
    const inThisChat = currentConversation?.participants?.some((p) => p._id === userId);
    if (inThisChat) {
      chatSubtitleEl.textContent = previewText;
      chatSubtitleEl.className = online ? 'chat-subtitle online' : 'chat-subtitle';
      chatAvatarEl.className = online ? 'avatar online' : 'avatar';
    }
  }

  // The global room shows a live count of everyone currently online.
  function refreshGlobalOnlineCount() {
    if (currentConversation?.type === 'global') {
      updateOnlineCount(onlinePresence.size + 1); // +1 for the current user
    }
  }

  // Seed the presence set from any list of user records that carry a status.
  function seedPresence(users) {
    if (!Array.isArray(users)) return;
    users.forEach((u) => {
      if (!u || !u._id || u._id === currentUser?._id) return;
      if (u.status === 'online') onlinePresence.add(u._id);
    });
  }

  // ========== NOTIFICATIONS ==========
  function updateNotificationBadge() {
    const count = friendRequests.incoming.length;
    if (count > 0) {
      notificationBadge.textContent = count;
      notificationBadge.classList.remove('hidden');
    } else {
      notificationBadge.classList.add('hidden');
    }
  }

  notificationBell.addEventListener('click', () => {
    switchTab('friends');
  });

  function updateConversationUnread(convId) {
    const convEl = conversationsList.querySelector(`[data-conv-id="${convId}"]`);
    if (convEl) {
      const badge = convEl.querySelector('.unread-badge');
      if (badge) {
        const current = parseInt(badge.textContent) || 0;
        badge.textContent = current + 1;
        badge.classList.remove('hidden');
      }
    }
  }

  function updateOnlineCount(count) {
    if (count > 0) {
      onlineCountEl.textContent = `${count} online`;
    } else {
      onlineCountEl.textContent = '';
    }
  }

  // ========== TOAST NOTIFICATIONS ==========
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'messageFadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========== UTILITY FUNCTIONS ==========
  function formatTime(timestamp) {
    const d = new Date(timestamp);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function formatLastSeen(timestamp) {
    if (!timestamp) return 'recently';
    
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function scrollSmart() {
    const threshold = 150;
    const nearBottom = (messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight) < threshold;
    if (nearBottom) scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function playMessageSound() {
    if (!settings.notificationSound) return;
    
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      console.error('Sound error:', e);
    }
  }

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // ========== MOBILE GESTURES ==========
  let touchStartX = 0;
  let touchEndX = 0;

  messagesEl.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  messagesEl.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 100;
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && isMobile && currentMobileView === 'chat') {
        // Swipe right - go back
        showSidebarMobile();
      }
    }
  }

  console.log('🚀 Premium Chat App initialized!');
})();
