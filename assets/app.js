/* assets/app.js
   - fully wired interface (Option B)
   - suggestions (Google suggest with JSONP fallback)
   - Enter / click / mobile search
   - voice search
   - AI MODE -> calls /api/chat (fallback to local mock)
   - account sign-in/out and menu
   - customize themes
*/

// helpers
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from((ctx||document).querySelectorAll(s));
const show = el => el && el.classList.remove('hidden');
const hide = el => el && el.classList.add('hidden');

// elements
const searchBox = $('#searchBox');
const searchForm = $('#searchForm');
const searchIcon = document.querySelector('.search-row .search-icon');
const clearBtn = $('#clearBtn');
const voiceBtn = $('#voiceBtn');
const suggestions = $('#suggestions');

const bookmarkBtn = $('#bookmarkBtn');
const trendingBtn = $('#trendingBtn');
const moreBtn = $('#moreBtn');

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

// THEME presets
const THEMES = {
  default: { '--accent':'#1a73e8', '--pill':'#ffffff' },
  midnight: { '--accent':'#8ab4f8', '--pill':'#0f1113' },
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
  if (localStorage.getItem('ailk-dark')==='1') document.body.classList.add('dark');
})();

themeToggle.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('ailk-dark', dark ? '1' : '0');
});

// ACCOUNT (sign-in/out)
function currentUser(){ return localStorage.getItem('ailk-user'); }
function setUser(name){ if (name) localStorage.setItem('ailk-user', name); else localStorage.removeItem('ailk-user'); updateAccountUI(); }
function updateAccountUI(){
  const user = currentUser();
  if (user){
    accountBtn.textContent = user;
    accName.textContent = user;
  } else {
    accountBtn.textContent = 'Sign in';
    accName.textContent = 'My Account';
  }
}
updateAccountUI();

accountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!currentUser()){
    const name = prompt('Sign in (demo) — enter display name:', 'My Account');
    if (name) setUser(name);
    return;
  }
  accountMenu.classList.toggle('hidden');
});
document.addEventListener('click', () => accountMenu.classList.add('hidden'));
accSignOut.addEventListener('click', ()=>{ setUser(null); alert('Signed out'); accountMenu.classList.add('hidden'); });
accCustomize.addEventListener('click', ()=>{ accountMenu.classList.add('hidden'); customizeTheme(); });
accHistory.addEventListener('click', ()=>{ accountMenu.classList.add('hidden'); alert('History (demo): not stored in this demo)'); });

// CUSTOMIZE
customizeBtn.addEventListener('click', customizeTheme);
function customizeTheme(){
  const choice = prompt('Choose theme: default, midnight, coral, emerald', localStorage.getItem('ailk-theme-name') || 'default');
  if (choice && THEMES[choice]) applyTheme(choice);
}

// SEARCH: suggestions using Google suggest (fetch then JSONP fallback)
async function fetchSuggestions(q){
  if (!q) return [];
  // try fetch
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[1])) return data[1].slice(0,7);
  } catch (e) {
    // fallback JSONP
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
  if (q===lastQ) return;
  lastQ = q;
  const list = await fetchSuggestions(q);
  suggestions.innerHTML = '';
  if (!list || list.length===0){ hide(suggestions); return; }
  list.forEach(s => {
    const div = document.createElement('div'); div.className='item'; div.textContent = s;
    div.addEventListener('click', ()=>{ searchBox.value = s; doSearch(); });
    suggestions.appendChild(div);
  });
  show(suggestions);
});

// clear button
clearBtn.addEventListener('click', ()=>{ searchBox.value=''; searchBox.focus(); suggestions.innerHTML=''; hide(suggestions); hide(clearBtn); });

// perform search (open Google results same tab) or open direct URL
function doSearch(){
  const q = searchBox.value.trim();
  if (!q) return;
  if (/^https?:\/\//i.test(q) || /\w+\.\w{2,}/.test(q)){
    window.location.href = q.startsWith('http') ? q : 'https://' + q;
    return;
  }
  window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

// Enter / click / form submit handling
searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter'){ e.preventDefault(); doSearch(); }
});
searchForm.addEventListener('submit', (e)=>{ e.preventDefault(); doSearch(); });
searchIcon.addEventListener('click', doSearch);

// VOICE SEARCH
if (window.SpeechRecognition || window.webkitSpeechRecognition){
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new Speech();
  recog.lang = 'en-US'; recog.interimResults = false;
  recog.onresult = (ev) => {
    const txt = ev.results[0][0].transcript;
    searchBox.value = txt;
    doSearch();
  };
  voiceBtn.addEventListener('click', ()=>{ try { recog.start(); } catch(e){} });
} else voiceBtn.title = 'Voice not supported';

// ICON BUTTONS under search
bookmarkBtn.addEventListener('click', ()=> {
  const name = prompt('Save bookmark (demo). Enter label for this page:', document.title);
  if (!name) return;
  const url = window.location.href;
  const list = JSON.parse(localStorage.getItem('ailk-bookmarks')||'[]');
  list.push({name, url, date: Date.now()});
  localStorage.setItem('ailk-bookmarks', JSON.stringify(list));
  alert('Saved bookmark (demo).');
});

trendingBtn.addEventListener('click', ()=> {
  // open a curated trending page (demo)
  window.open('https://www.google.com/trends', '_blank');
});

moreBtn.addEventListener('click', ()=> {
  // open small menu implemented via prompt for demo
  const choice = prompt('More options (type "settings" or "help")', 'settings');
  if (!choice) return;
  if (choice.toLowerCase().includes('settings')) customizeTheme();
  if (choice.toLowerCase().includes('help')) alert('AiLK demo — use the search bar, AI MODE, sign-in to personalize.');
});

// AI MODE — open drawer and send messages to server /api/chat (fallback local mock)
aiModeBtn.addEventListener('click', ()=>{ show(aiDrawer); aiDrawer.classList.remove('hidden'); aiDrawer.setAttribute('aria-hidden','false'); });
aiClose.addEventListener('click', ()=>{ hide(aiDrawer); aiDrawer.classList.add('hidden'); aiDrawer.setAttribute('aria-hidden','true'); });

// append chat
function appendChat(role, text){
  const d = document.createElement('div'); d.className = 'chat-msg ' + (role==='user' ? 'user' : 'ai'); d.textContent = text;
  chatLog.appendChild(d); chatLog.scrollTop = chatLog.scrollHeight;
}

// send AI query (try server /api/chat; fallback to local mock)
async function sendAiQuery(prompt){
  appendChat('user', prompt);
  appendChat('ai', 'Thinking...');
  try {
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ message: prompt })
    });
    if (res.ok){
      const j = await res.json();
      const last = chatLog.querySelector('.chat-msg.ai:last-child'); if (last) last.remove();
      appendChat('ai', j.reply || j.result || 'No reply');
      return;
    }
  } catch(e){}
  // fallback local mock
  const last = chatLog.querySelector('.chat-msg.ai:last-child'); if (last) last.remove();
  appendChat('ai', localAiReply(prompt));
}

function localAiReply(prompt){
  prompt = prompt.toLowerCase();
  if (prompt.includes('time')) return `Current time: ${new Date().toLocaleTimeString()}`;
  if (prompt.includes('hello')||prompt.includes('hi')) return 'Hello! I am AiLK assistant. How can I help?';
  if (prompt.includes('define')) return 'Definition (demo): This is a demo response from AiLK.';
  return "I can't reach the AI server in this demo. To enable full ChatGPT replies, run the optional server and provide your OpenAI API key.";
}

aiForm.addEventListener('submit', (e)=>{ e.preventDefault(); const txt = (aiInput.value||'').trim(); if (!txt) return; aiInput.value=''; sendAiQuery(txt); });

// initialize: show account name if signed in
if (currentUser()) accountBtn.textContent = currentUser();
