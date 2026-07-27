// ========== MEDIA KEYBOARD - GIF/EMOJI/STICKER PICKER ==========
// Advanced media keyboard with categories, search, and favorites

class MediaKeyboard {
  constructor(options = {}) {
    this.containerId = options.containerId || 'media-keyboard';
    this.onSelect = options.onSelect || (() => {});
    this.apiKey = options.tenorApiKey || 'AIzaSyAC7hbJNTjxwFxC7hK1WLWZGQEjbRzKWjQ'; // Free Tenor API key
    
    this.currentTab = 'emoji';
    this.searchQuery = '';
    this.recentEmojis = JSON.parse(localStorage.getItem('recentEmojis') || '[]');
    this.favoriteGifs = JSON.parse(localStorage.getItem('favoriteGifs') || '[]');
    this.gifs = [];
    this.stickers = [];
    
    this.emojiCategories = {
      recent: { name: 'Recent', icon: '🕒', emojis: [] },
      smileys: { name: 'Smileys', icon: '😀', emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓'] },
      gestures: { name: 'Gestures', icon: '👍', emojis: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤝','💪','🙏','✍️','💅','🤳','👏','🙌','🤲','🤜','🤛','✊','👊','🤌','👐'] },
      hearts: { name: 'Hearts', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','❤️‍🔥','❤️‍🩹','💌','💋','😍','🥰','😘','💑','💏','👩‍❤️‍👨','👨‍❤️‍👨','👩‍❤️‍👩'] },
      animals: { name: 'Animals', icon: '🐶', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🦎','🐙','🦑','🦐','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'] },
      food: { name: 'Food', icon: '🍕', emojis: ['🍕','🍔','🍟','🌭','🍿','🧈','🥓','🥚','🍳','🧇','🥞','🧈','🍞','🥐','🥨','🥯','🥖','🧀','🥗','🥙','🥪','🌮','🌯','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊'] },
      activities: { name: 'Activities', icon: '⚽', emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🪘','🥁','🪇','🎷','🎺','🪗','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'] },
      travel: { name: 'Travel', icon: '✈️', emojis: ['✈️','🛫','🛬','🪂','💺','🚁','🛩️','🛸','🚀','🛰️','🚆','🚈','🚄','🚝','🚅','🚞','🚂','🚃','🚋','🚊','🚉','🚇','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🚚','🚛','🚜','🏎️','🏍️','🛵','🦽','🦼','🛺','🚲','🛴','🛹','🚏','🛣️','🛤️','🛢️','⛽','🚨','🚥','🚦','🛑','🚧','⚓','⛵','🛶','🚤','🛳️','⛴️','🛥️','🚢'] },
      objects: { name: 'Objects', icon: '⚡', emojis: ['⚡','☀️','🌙','⭐','🌟','💫','✨','⚡','☄️','💥','🔥','🌈','☁️','⛅','⛈️','🌤️','🌥️','🌦️','🌧️','🌨️','🌩️','🌪️','🌫️','🌬️','☃️','⛄','❄️','💨','💧','💦','🫧','☔','☂️','🌊','🌀'] },
      symbols: { name: 'Symbols', icon: '💯', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓'] },
      flags: { name: 'Flags', icon: '🏁', emojis: ['🏁','🚩','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️','🇦🇫','🇦🇱','🇩🇿','🇦🇸','🇦🇩','🇦🇴','🇦🇮','🇦🇶','🇦🇬','🇦🇷','🇦🇲','🇦🇼','🇦🇺','🇦🇹','🇦🇿','🇧🇸','🇧🇭','🇧🇩','🇧🇧','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇲','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇮🇴','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇮🇨','🇨🇻','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇳','🇨🇽','🇨🇨','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇰','🇨🇷','🇨🇮','🇭🇷','🇨🇺','🇨🇼','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇲','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇪🇺','🇫🇰','🇫🇴','🇫🇯','🇫🇮','🇫🇷','🇬🇫','🇵🇫','🇹🇫','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇮','🇬🇷','🇬🇱','🇬🇩','🇬🇵','🇬🇺','🇬🇹','🇬🇬','🇬🇳','🇬🇼','🇬🇾','🇭🇹','🇭🇳','🇭🇰','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇯🇲','🇯🇵','🇯🇪','🇯🇴','🇰🇿','🇰🇪','🇰🇮','🇽🇰','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇮','🇱🇹','🇱🇺','🇲🇴','🇲🇰','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇭','🇲🇶','🇲🇷','🇲🇺','🇾🇹','🇲🇽','🇫🇲','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇸','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇷','🇳🇵','🇳🇱','🇳🇨','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇳🇺','🇳🇫','🇰🇵','🇲🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇼','🇵🇸','🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇳','🇵🇱','🇵🇹','🇵🇷','🇶🇦','🇷🇪','🇷🇴','🇷🇺','🇷🇼','🇧🇱','🇸🇭','🇰🇳','🇱🇨','🇵🇲','🇻🇨','🇼🇸','🇸🇲','🇸🇹','🇸🇦','🇸🇳','🇷🇸','🇸🇨','🇸🇱','🇸🇬','🇸🇽','🇸🇰','🇸🇮','🇸🇧','🇸🇴','🇿🇦','🇬🇸','🇰🇷','🇸🇸','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇯','🇸🇿','🇸🇪','🇨🇭','🇸🇾','🇹🇼','🇹🇯','🇹🇿','🇹🇭','🇹🇱','🇹🇬','🇹🇰','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇹🇨','🇹🇻','🇺🇬','🇺🇦','🇦🇪','🇬🇧','🇺🇸','🇺🇾','🇺🇿','🇻🇺','🇻🇦','🇻🇪','🇻🇳','🇼🇫','🇪🇭','🇾🇪','🇿🇲','🇿🇼','🏴󐁧󐁢󐁥󐁮󐁧󐁿','🏴󐁧󐁢󐁳󐁣󐁴󐁿','🏴󐁧󐁢󐁷󐁬󐁳󐁿'] }
    };
    
    this.init();
  }

  init() {
    this.createKeyboardHTML();
    this.attachEventListeners();
    this.updateRecentEmojis();
  }

  createKeyboardHTML() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container #${this.containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="media-keyboard-wrapper">
        <!-- Header with tabs -->
        <div class="media-keyboard-header">
          <div class="media-keyboard-tabs">
            <button class="media-tab active" data-tab="emoji">
              <span class="media-tab-icon">😊</span>
              <span class="media-tab-label">Emoji</span>
            </button>
            <button class="media-tab" data-tab="gif">
              <span class="media-tab-icon">🎬</span>
              <span class="media-tab-label">GIFs</span>
            </button>
            <button class="media-tab" data-tab="sticker">
              <span class="media-tab-icon">🎨</span>
              <span class="media-tab-label">Stickers</span>
            </button>
          </div>
          <button class="media-keyboard-close" title="Close">×</button>
        </div>

        <!-- Search bar -->
        <div class="media-keyboard-search">
          <input type="text" 
                 id="media-search-input" 
                 class="media-search-input" 
                 placeholder="Search..."
                 autocomplete="off">
          <span class="media-search-icon">🔍</span>
        </div>

        <!-- Content area -->
        <div class="media-keyboard-content">
          <!-- Emoji Tab -->
          <div class="media-tab-content active" id="emoji-content">
            <div class="emoji-categories">
              ${Object.keys(this.emojiCategories).map(key => `
                <button class="emoji-category-btn ${key === 'recent' ? 'active' : ''}" 
                        data-category="${key}"
                        title="${this.emojiCategories[key].name}">
                  ${this.emojiCategories[key].icon}
                </button>
              `).join('')}
            </div>
            <div class="emoji-grid-container">
              <div id="emoji-grid" class="emoji-grid"></div>
            </div>
          </div>

          <!-- GIF Tab -->
          <div class="media-tab-content" id="gif-content">
            <div class="gif-grid" id="gif-grid">
              <div class="media-loading">Loading GIFs...</div>
            </div>
          </div>

          <!-- Sticker Tab -->
          <div class="media-tab-content" id="sticker-content">
            <div class="sticker-grid" id="sticker-grid">
              <div class="media-info">
                <p>🎨 Stickers Coming Soon!</p>
                <p class="media-info-sub">Use emojis and GIFs for now</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="media-keyboard-footer">
          <div class="media-keyboard-info">
            <span class="media-keyboard-powered">Powered by Tenor</span>
          </div>
        </div>
      </div>
    `;

    // Render initial emoji grid
    this.renderEmojiCategory('recent');
  }

  attachEventListeners() {
    // Tab switching
    document.querySelectorAll('.media-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Close button
    const closeBtn = document.querySelector('.media-keyboard-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Search input
    const searchInput = document.getElementById('media-search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });
    }

    // Emoji category buttons
    document.querySelectorAll('.emoji-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.emoji-category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderEmojiCategory(btn.dataset.category);
      });
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      const keyboard = document.getElementById(this.containerId);
      if (!keyboard.contains(e.target) && 
          !e.target.closest('.emoji-btn') && 
          !e.target.closest('[data-trigger="media-keyboard"]')) {
        this.hide();
      }
    });
  }

  switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.media-tab[data-tab="${tab}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.media-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}-content`).classList.add('active');

    this.currentTab = tab;
    this.searchQuery = '';
    document.getElementById('media-search-input').value = '';

    // Load content for active tab
    if (tab === 'gif' && this.gifs.length === 0) {
      this.loadTrendingGifs();
    }
  }

  handleSearch(query) {
    this.searchQuery = query.trim();

    if (!this.searchQuery) {
      if (this.currentTab === 'emoji') {
        this.renderEmojiCategory('recent');
      } else if (this.currentTab === 'gif') {
        this.loadTrendingGifs();
      }
      return;
    }

    if (this.currentTab === 'emoji') {
      this.searchEmojis(this.searchQuery);
    } else if (this.currentTab === 'gif') {
      this.searchGifs(this.searchQuery);
    }
  }

  // ===== EMOJI METHODS =====

  renderEmojiCategory(category) {
    const grid = document.getElementById('emoji-grid');
    const emojis = category === 'recent' 
      ? this.recentEmojis.slice(0, 50)
      : this.emojiCategories[category]?.emojis || [];

    if (emojis.length === 0) {
      grid.innerHTML = '<div class="media-empty">No emojis yet. Start using them!</div>';
      return;
    }

    grid.innerHTML = emojis.map(emoji => `
      <button class="emoji-item" data-emoji="${emoji}" title="${emoji}">
        ${emoji}
      </button>
    `).join('');

    // Attach click handlers
    grid.querySelectorAll('.emoji-item').forEach(item => {
      item.addEventListener('click', () => {
        const emoji = item.dataset.emoji;
        this.selectEmoji(emoji);
      });
    });
  }

  searchEmojis(query) {
    const grid = document.getElementById('emoji-grid');
    const lowerQuery = query.toLowerCase();
    
    // Search through all categories
    const results = [];
    Object.keys(this.emojiCategories).forEach(key => {
      if (key === 'recent') return;
      this.emojiCategories[key].emojis.forEach(emoji => {
        if (results.length < 100) { // Limit results
          results.push(emoji);
        }
      });
    });

    // Filter based on query (you could add emoji names/keywords here)
    const filtered = results.slice(0, 50);

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="media-empty">No emojis found</div>';
      return;
    }

    grid.innerHTML = filtered.map(emoji => `
      <button class="emoji-item" data-emoji="${emoji}">
        ${emoji}
      </button>
    `).join('');

    grid.querySelectorAll('.emoji-item').forEach(item => {
      item.addEventListener('click', () => {
        const emoji = item.dataset.emoji;
        this.selectEmoji(emoji);
      });
    });
  }

  selectEmoji(emoji) {
    // Add to recent
    this.recentEmojis = [emoji, ...this.recentEmojis.filter(e => e !== emoji)].slice(0, 50);
    localStorage.setItem('recentEmojis', JSON.stringify(this.recentEmojis));
    this.updateRecentEmojis();

    // Call callback
    this.onSelect({ type: 'emoji', data: emoji });
  }

  updateRecentEmojis() {
    this.emojiCategories.recent.emojis = this.recentEmojis;
  }

  // ===== GIF METHODS =====

  async loadTrendingGifs() {
    const grid = document.getElementById('gif-grid');
    grid.innerHTML = '<div class="media-loading">🎬 Loading trending GIFs...</div>';

    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/featured?key=${this.apiKey}&limit=30&media_filter=gif`
      );
      
      if (!response.ok) throw new Error('Failed to load GIFs');
      
      const data = await response.json();
      this.gifs = data.results || [];
      this.renderGifs(this.gifs);
    } catch (error) {
      console.error('Load GIFs error:', error);
      grid.innerHTML = '<div class="media-error">❌ Failed to load GIFs. Check your connection.</div>';
    }
  }

  async searchGifs(query) {
    const grid = document.getElementById('gif-grid');
    grid.innerHTML = '<div class="media-loading">🔍 Searching GIFs...</div>';

    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?key=${this.apiKey}&q=${encodeURIComponent(query)}&limit=30&media_filter=gif`
      );
      
      if (!response.ok) throw new Error('Failed to search GIFs');
      
      const data = await response.json();
      this.gifs = data.results || [];
      
      if (this.gifs.length === 0) {
        grid.innerHTML = '<div class="media-empty">No GIFs found. Try a different search!</div>';
        return;
      }
      
      this.renderGifs(this.gifs);
    } catch (error) {
      console.error('Search GIFs error:', error);
      grid.innerHTML = '<div class="media-error">❌ Failed to search GIFs.</div>';
    }
  }

  renderGifs(gifs) {
    const grid = document.getElementById('gif-grid');
    
    if (gifs.length === 0) {
      grid.innerHTML = '<div class="media-empty">No GIFs available</div>';
      return;
    }

    grid.innerHTML = gifs.map(gif => {
      const media = gif.media_formats?.gif || gif.media_formats?.tinygif;
      if (!media) return '';
      
      return `
        <div class="gif-item" 
             data-gif-url="${media.url}"
             data-gif-id="${gif.id}"
             title="${gif.content_description || 'GIF'}">
          <img src="${media.url}" 
               alt="${gif.content_description || 'GIF'}"
               loading="lazy">
          <div class="gif-overlay">
            <button class="gif-select-btn">Send</button>
          </div>
        </div>
      `;
    }).filter(html => html).join('');

    // Attach click handlers
    grid.querySelectorAll('.gif-item').forEach(item => {
      item.addEventListener('click', () => {
        const gifUrl = item.dataset.gifUrl;
        const gifId = item.dataset.gifId;
        this.selectGif(gifUrl, gifId);
      });
    });
  }

  selectGif(url, id) {
    // Add to favorites (could be implemented later)
    this.onSelect({ type: 'gif', data: { url, id } });
  }

  // ===== UTILITY METHODS =====

  show() {
    const keyboard = document.getElementById(this.containerId);
    if (keyboard) {
      keyboard.classList.add('active');
      keyboard.classList.remove('hidden');
      
      // Focus search if not emoji tab
      if (this.currentTab !== 'emoji') {
        setTimeout(() => {
          const searchInput = document.getElementById('media-search-input');
          if (searchInput) searchInput.focus();
        }, 100);
      }
    }
  }

  hide() {
    const keyboard = document.getElementById(this.containerId);
    if (keyboard) {
      keyboard.classList.remove('active');
      keyboard.classList.add('hidden');
    }
  }

  toggle() {
    const keyboard = document.getElementById(this.containerId);
    if (keyboard && keyboard.classList.contains('active')) {
      this.hide();
    } else {
      this.show();
    }
  }

  destroy() {
    const keyboard = document.getElementById(this.containerId);
    if (keyboard) {
      keyboard.innerHTML = '';
    }
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaKeyboard;
}
