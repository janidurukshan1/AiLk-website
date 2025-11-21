/* assets/app.js */

// --------- helpers ----------
const $ = (s, ctx=document) => ctx.querySelector(s);
const show = (el) => el && (el.hidden = false, el.classList.remove('hidden'));
const hide = (el) => el && (el.hidden = true, el.classList.add('hidden'));

// elements
const searchInput = $('#search-input');
const searchBtn = $('#search-btn');
const voiceBtn = $('#voice-btn');
const suggestionsBox = $('#suggestions');
const aiToggle = $('#ai-mode-toggle');
const aiDrawer = $('#ai-drawer');
const aiClose = $('#ai-close');
const aiForm = $('#ai-form');
const aiInput = $('#ai-input');
const chatLog = $('#chat-log');

const btnSignIn = $('#btn-signin');
const btnSignOut = $('#btn-signout');
const btnCustomize = $('#btn-customize');
const themeToggle = $('#theme-toggle');

// --- Theme persistence
if (localStorage.getItem('ailk-theme') === 'dark') document.body.classList.add('dark');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('ailk-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// --- Mock sign-in/out
function updateAuthUI() {
  const user = localStorage.getItem('ailk-user');
  if (user) {
    btnSignIn.style.display = 'none';
    btnSignOut.style.display = 'inline-block';
    btnCustomize.style.display = 'inline-block';
  } else {
    btnSignIn.style.display = 'inline-block';
    btnSignOut.style.display = 'none';
    btnCustomize.style.display = 'none';
  }
}
updateAuthUI();

btnSignIn.addEventListener('click', () => {
  const name = prompt('Sign in (demo): enter name');
  if (name) {
    localStorage.setItem('ailk-user', name);
    updateAuthUI();
    alert('Signed in as ' + name);
  }
});
btnSignOut.addEventListener('click', () => {
  localStorage.removeItem('ailk-user');
  updateAuthUI();
  alert('Signed out');
});
btnCustomize.addEventListener('click', () => {
  if (!localStorage.getItem('ailk-user')) { alert('Sign in to customize.'); return; }
  const theme = localStorage.getItem('ailk-theme') || 'light';
  const n = prompt('Customize demo (mock). Enter "dark" or "light" for theme:', theme);
  if (n) { localStorage.setItem('ailk-theme', n); if (n==='dark') document.body.classList.add('dark'); else document.body.classList.remove('dark'); }
});

// --- search behavior: Enter key and click
function doSearch() {
  const q = (searchInput.value || '').trim();
  if (!q) return;
  // if looks like url open directly
  if (/^https?:\/\//i.test(q) || /\w+\.\w{2,}/.test(q)) {
    window.location.href = q.startsWith('http') ? q : 'https://' + q;
    return;
  }
  // open real google results in same tab
  window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}
searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});

// --- voice search (Web Speech API)
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new Speech();
  recog.lang = 'en-US';
  recog.interimResults = false;
  voiceBtn.addEventListener('click', () => {
    try { recog.start(); } catch(e) {}
  });
  recog.onresult = (ev) => {
    const txt = ev.results[0][0].transcript;
    searchInput.value = txt;
    doSearch();
  };
} else {
  voiceBtn.title = 'Voice not supported';
}

// --- suggestions from Google (best-effort; CORS may block)
let lastSuggest = '';
searchInput.addEventListener('input', async () => {
  const q = searchInput.value.trim();
  if (!q) { suggestionsBox.innerHTML = ''; hide(suggestionsBox); return; }
  if (q === lastSuggest) return;
  lastSuggest = q;
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    const list = data[1] || [];
    suggestionsBox.innerHTML = '';
    list.slice(0,7).forEach(s => {
      const div = document.createElement('div'); div.className='item'; div.textContent = s;
      div.addEventListener('click', () => { searchInput.value = s; doSearch(); });
      suggestionsBox.appendChild(div);
    });
    show(suggestionsBox);
  } catch(e) {
    hide(suggestionsBox);
  }
});

// --- AI MODE UI toggles ---
aiToggle.addEventListener('click', () => {
  show(aiDrawer);
  aiDrawer.classList.remove('hidden');
});
aiClose.addEventListener('click', () => {
  hide(aiDrawer);
  aiDrawer.classList.add('hidden');
});

// --- AI chat (frontend calls server /api/chat) ---
function appendChat(role, text) {
  const d = document.createElement('div'); d.className = 'chat-msg ' + (role==='user' ? 'user' : 'ai');
  d.textContent = text;
  chatLog.appendChild(d);
  chatLog.scrollTop = chatLog.scrollHeight;
}

aiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const txt = (aiInput.value || '').trim();
  if (!txt) return;
  appendChat('user', txt);
  aiInput.value = '';
  appendChat('ai', '...'); // placeholder
  // call server
  try {
    const token = localStorage.getItem('ailk-api-token') || ''; // optional token if you add auth
    const res = await fetch('/api/chat', {
      method:'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ message: txt })
    });
    const data = await res.json();
    // remove last placeholder
    const last = chatLog.querySelector('.chat-msg.ai:last-child');
    if (last) last.remove();
    if (res.ok && data?.reply) appendChat('ai', data.reply);
    else appendChat('ai', data?.error || 'AI reply failed');
  } catch (err) {
    const last = chatLog.querySelector('.chat-msg.ai:last-child'); if (last) last.remove();
    appendChat('ai', 'Network error: ' + err.message);
  }
});
