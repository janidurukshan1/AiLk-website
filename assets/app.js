/* assets/app.js
   - sign-in/out
   - suggestions (Google suggest with JSONP fallback)
   - search open (Enter / click / mobile)
   - AI MODE (calls /api/chat then falls back to mock)
   - customize: multiple color themes
*/

// --- Helpers
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

// --- Elements
const searchBox = $('#searchBox');
const searchBtn = $('#searchForm .search-icon') || $('#searchForm button[type="submit"]');
const clearBtn = $('#clearBtn');
const voiceBtn = $('#voiceBtn');
const suggestions = $('#suggestions');
const aiModeBtn = $('#aiModeBtn');
const aiDrawer = $('#aiDrawer');
const aiClose = $('#aiClose');
const aiForm = $('#aiForm');
const aiInput = $('#aiInput');
const chatLog = $('#chatLog');

const accountBtn = $('#accountBtn');
const accountMenu = $('#accountMenu');
const accName = $('#accName');
const accSignOut = $('#accSignOut');
const accCustomize = $('#accCustomize');
const accHistory = $('#accHistory');

const customizeBtn = $('#customizeBtn');
const themeToggle = $('#themeToggle');

// --- Theme handling & customization
const THEMES = {
  default: { '--accent':'#1a73e8', '--pill':'#f1f3f4' },
  midnight: { '--accent':'#8ab4f8', '--pill':'#151515' },
  coral: { '--accent':'#ff6b6b', '--pill':'#fff0f0' },
  emerald: { '--accent':'#2ecc71', '--pill':'#f1fff6' }
};

function applyTheme(name){
  const t = THEMES[name] || THEMES.default;
  Object.keys(t).forEach(k => document.documentElement.style.setProperty(k, t[k]));
  localStorage.setItem('ailk-theme-name', name);
}
(function loadTheme(){
  const name = localStorage.getItem('ailk-theme-name') || 'default';
  applyTheme(name);
  const dark = localStorage.getItem('ailk-dark') === '1';
  if (dark) document.body.classList.add('dark');
})();

themeToggle.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('ailk-dark', dark ? '1' : '0');
});

// Customize opens a small modal (simple prompt)
customizeBtn.addEventListener('click', () => {
  const name = prompt('Choose theme: default, midnight, coral, emerald', localStorage.getItem('ailk-theme-name') || 'default');
  if (name && THEMES[name]) applyTheme(name);
});

// --- Sign in / account UI
function currentUser(){ return localStorage.getItem('ailk-user'); }
function setUser(name){ if (name) localStorage.setItem('ailk-user', name); else localStorage.removeItem('ailk-user'); updateAccountUI(); }

function updateAccountUI(){
  const user = currentUser();
  if (user){
    accountBtn.textContent = user;
    show(accountMenu); // menu available via click
    hide(accountMenu); // keep hidden until clicked
    $('#customizeBtn').style.display = 'inline-block';
  } else {
    accountBtn.textContent = 'Sign in';
    hide(accountMenu);
    $('#customizeBtn').style.display = 'inline-block';
  }
}
updateAccountUI();

accountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const user = currentUser();
  if (!user){
    // quick sign in prompt (demo). default name "My Account"
    const name = prompt('Sign in (demo). Enter your display name:', 'My Account');
    if (name) setUser(name);
    updateAccountUI();
    return;
  }
  // toggle menu
  accountMenu.classList.toggle('hidden');
});

document.addEventListener('click', () => {
  accountMenu.classList.add('hidden');
});

accSignOut.addEventListener('click', () => {
  setUser(null);
  accountMenu.classList.add('hidden');
  alert('Signed out');
});

accCustomize.addEventListener('click', () => {
  accountMenu.classList.add('hidden');
  const name = prompt('Choose theme: default, midnight, coral, emerald', localStorage.getItem('ailk-theme-name') || 'default');
  if (name && THEMES[name]) applyTheme(name);
});

accHistory.addEventListener('click', () => {
  accountMenu.classList.add('hidden');
  alert('History (demo): No stored history in this demo.');
});

// Show account name on startup if exists
if (currentUser()) accountBtn.textContent = currentUser();

// --- Search behavior (Enter / Search button / clickable suggestions)
async function fetchSuggestions(q){
  if (!q) return [];
  // try fetch; if blocked, fallback to JSONP
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[1])) return data[1].slice(0,7);
  } catch (err) {
    // JSONP fallback
    return new Promise((resolve) => {
      const cb = '__sugg_cb_' + Date.now();
      window[cb] = (data) => {
        try { resolve((data && data[1]) ? data[1].slice(0,7) : []); } finally { script.remove(); delete window[cb]; }
      };
      const script = document.createElement('script');
      script.src = `https://suggestqueries.google.com/complete/search?client=chrome&hl=en&q=${encodeURIComponent(q)}&callback=${cb}`;
      script.onerror = () => { delete window[cb]; script.remove(); resolve([]); };
      document.body.appendChild(script);
    });
  }
  return [];
}

let lastQ = '';
searchBox.addEventListener('input', async () => {
  const q = searchBox.value.trim();
  if (!q){ suggestions.innerHTML=''; hide(suggestions); hide(clearBtn); return; }
  show(clearBtn);
  if (q === lastQ) return;
  lastQ = q;
  const list = await fetchSuggestions(q);
  suggestions.innerHTML = '';
  if (!list || list.length === 0){ hide(suggestions); return; }
  list.forEach(s => {
    const div = document.createElement('div'); div.className = 'item'; div.textContent = s;
    div.addEventListener('click', () => {
      searchBox.value = s;
      doSearch();
    });
    suggestions.appendChild(div);
  });
  show(suggestions);
});

clearBtn.addEventListener('click', () => { searchBox.value=''; searchBox.focus(); suggestions.innerHTML=''; hide(suggestions); hide(clearBtn); });

// perform search: opens Google results (same tab)
function doSearch(){
  const q = (searchBox.value || '').trim();
  if (!q) return;
  // if seems like URL open it
  if (/^https?:\/\//i.test(q) || /\w+\.\w{2,}/.test(q)){
    window.location.href = q.startsWith('http') ? q : 'https://' + q;
    return;
  }
  window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

// Enter and click handling
searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
});
document.querySelector('.search-row .search-icon').addEventListener('click', () => doSearch());
$('#searchForm').addEventListener('submit', (e) => { e.preventDefault(); doSearch(); });

// Voice search
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new Speech();
  recog.lang = 'en-US';
  recog.interimResults = false;
  recog.onresult = (ev) => {
    const txt = ev.results[0][0].transcript;
    searchBox.value = txt;
    doSearch();
  };
  voiceBtn.addEventListener('click', () => {
    try { recog.start(); } catch(e){}
  });
} else {
  voiceBtn.title = 'Voice search not supported';
}

// --- AI MODE logic ---
// Opens drawer and sends messages to server /api/chat; fallback to local mock reply
aiModeBtn.addEventListener('click', () => {
  show(aiDrawer); aiDrawer.classList.remove('hidden');
});
aiClose.addEventListener('click', () => {
  hide(aiDrawer); aiDrawer.classList.add('hidden');
});

// append chat message
function appendChat(role, text){
  const d = document.createElement('div');
  d.className = 'chat-msg ' + (role === 'user' ? 'user' : 'ai');
  d.textContent = text;
  chatLog.appendChild(d);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// send AI query
async function sendAiQuery(prompt){
  appendChat('user', prompt);
  appendChat('ai', 'Thinking...');
  try {
    // try server endpoint
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ message: prompt })
    });
    if (res.ok){
      const j = await res.json();
      // remove last placeholder
      const last = chatLog.querySelector('.chat-msg.ai:last-child');
      if (last) last.remove();
      appendChat('ai', j.reply || j.result || 'No reply');
      return;
    }
  } catch(e){
    // ignore - fallback below
  }
  // fallback local mock (fast)
  const last2 = chatLog.querySelector('.chat-msg.ai:last-child');
  if (last2) last2.remove();
  const mock = localAiReply(prompt);
  appendChat('ai', mock);
}

// simple local mock AI (fallback)
function localAiReply(prompt){
  prompt = prompt.toLowerCase();
  if (prompt.includes('time')) return `Current time: ${new Date().toLocaleTimeString()}`;
  if (prompt.includes('hello') || prompt.includes('hi')) return 'Hello! I am AiLK assistant. How can I help?';
  if (prompt.includes('weather')) return "I can't fetch live weather in this demo. Try 'weather in london' on Google.";
  return "Sorry — AI MODE requires a server to provide live ChatGPT answers. This is a demo fallback.";
}

aiForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const txt = (aiInput.value || '').trim();
  if (!txt) return;
  aiInput.value = '';
  sendAiQuery(txt);
});

// init: if demo user exists show name
if (currentUser()) accountBtn.textContent = currentUser();
