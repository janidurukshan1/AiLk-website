/* AiLK - JS (search + voice + suggestions + tabs + share) */

(function () {
  // helpers
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const isHome = () => document.getElementById('home-page') !== null;

  // DOM elements
  const homeQuery = $('#home-query');
  const homeClear = $('#home-clear');
  const homeMic = $('#home-mic');
  const homeSuggestions = $('#home-suggestions');
  const searchBtn = $('#search-btn');
  const luckyBtn = $('#lucky-btn');

  const resultsPage = $('#results-page');
  const resultsQuery = $('#results-query');
  const resultsClear = $('#results-clear');
  const resultsMic = $('#results-mic');
  const resultsSuggestions = $('#results-suggestions');
  const resultsMain = $('#results-main');

  const themeToggle = $('#theme-toggle');
  const shareWhatsApp = $('#share-whatsapp');

  // theme init
  (function initTheme() {
    const theme = localStorage.getItem('ailk-theme');
    if (theme === 'dark') {
      document.body.classList.add('dark');
      themeToggle.textContent = '🌙 Dark';
    } else {
      themeToggle.textContent = '🌞 Light';
    }
  })();

  themeToggle?.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    themeToggle.textContent = dark ? '🌙 Dark' : '🌞 Light';
    localStorage.setItem('ailk-theme', dark ? 'dark' : 'light');
  });

  // WhatsApp share: builds a message and opens whatsapp web/mobile
  shareWhatsApp?.addEventListener('click', () => {
    const url = location.href;
    const message = encodeURIComponent(`Check out AiLK — my demo search site: ${url}`);
    // Prepares WhatsApp web link (works on mobile too)
    const wa = `https://wa.me/?text=${message}`;
    window.open(wa, '_blank');
  });

  // --------------------
  // Suggestions (Google public endpoint)
  // --------------------
  function fetchSuggestions(query, onDone) {
    if (!query || !query.trim()) return onDone([]);
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(query)}`;
    fetch(url).then(r => r.json()).then(data => {
      if (Array.isArray(data) && Array.isArray(data[1])) onDone(data[1].slice(0,8));
      else onDone([]);
    }).catch(err => {
      // fallback to empty
      onDone([]);
    });
  }

  function renderSuggestionList(list, container, onPick) {
    container.innerHTML = '';
    if (!list || list.length === 0) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    list.forEach(t => {
      const it = document.createElement('div');
      it.className = 'item';
      it.textContent = t;
      it.addEventListener('click', () => onPick(t));
      container.appendChild(it);
    });
  }

  // --------------------
  // Voice recognition (Web Speech API)
  // --------------------
  function createRecognizer(onResult, onStart, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult && onResult(text);
    };
    r.onstart = () => onStart && onStart();
    r.onend = () => onEnd && onEnd();
    r.onerror = () => onEnd && onEnd();
    return r;
  }

  // HOME behaviors
  function initHome() {
    if (!homeQuery) return;
    let lastQ = '';

    homeQuery.addEventListener('input', () => {
      const q = homeQuery.value.trim();
      homeClear.classList.toggle('hidden', q.length === 0);
      if (!q) { homeSuggestions.classList.add('hidden'); return; }
      if (q === lastQ) return;
      lastQ = q;
      fetchSuggestions(q, list => renderSuggestionList(list, homeSuggestions, (s) => {
        homeQuery.value = s;
        doSearch();
      }));
    });

    homeClear.addEventListener('click', () => {
      homeQuery.value = '';
      homeClear.classList.add('hidden');
      homeSuggestions.classList.add('hidden');
      homeQuery.focus();
    });

    const recognizer = createRecognizer(
      (text) => { homeQuery.value = text; doSearch(); },
      () => homeMic.classList.add('listening'),
      () => homeMic.classList.remove('listening')
    );
    homeMic.addEventListener('click', () => {
      if (!recognizer) { alert('Voice search not supported in this browser'); return; }
      try { recognizer.start(); } catch(e) {}
    });

    searchBtn?.addEventListener('click', doSearch);
    luckyBtn?.addEventListener('click', () => {
      const q = homeQuery.value.trim().toLowerCase();
      if (!q) { window.location.href = 'https://www.google.com/doodles'; return; }
      if (q.includes('youtube')) window.open('https://www.youtube.com', '_blank');
      else if (q.includes('facebook')) window.open('https://www.facebook.com', '_blank');
      else if (q.includes('whatsapp')) window.open('https://www.whatsapp.com', '_blank');
      else window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank');
    });
  }

  // RESULTS behaviors
  function initResults() {
    if (!resultsQuery) return;
    let last = '';
    resultsQuery.addEventListener('input', () => {
      const q = resultsQuery.value.trim();
      resultsClear.classList.toggle('hidden', q.length === 0);
      if (!q) { resultsSuggestions.classList.add('hidden'); return; }
      if (q === last) return;
      last = q;
      fetchSuggestions(q, (list) => renderSuggestionList(list, resultsSuggestions, (s) => {
        resultsQuery.value = s;
        renderActiveTab();
      }));
    });

    resultsClear.addEventListener('click', () => {
      resultsQuery.value = '';
      resultsClear.classList.add('hidden');
      resultsSuggestions.classList.add('hidden');
      resultsQuery.focus();
      resultsMain.innerHTML = '';
    });

    const recognizer = createRecognizer(
      (text) => { resultsQuery.value = text; renderActiveTab(); },
      () => resultsMic.classList.add('listening'),
      () => resultsMic.classList.remove('listening')
    );
    resultsMic.addEventListener('click', () => {
      if (!recognizer) { alert('Voice search not supported in this browser'); return; }
      try { recognizer.start(); } catch(e) {}
    });

    // tab clicks
    $$('.tab').forEach(btn => btn.addEventListener('click', (e) => {
      $$('.tab').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderActiveTab();
    }));
  }

  // Basic sample data used for demo results
  const SAMPLE = [
    { title: 'YouTube', url: 'https://www.youtube.com/', snippet: 'Enjoy the videos and music you love.' },
    { title: 'Facebook', url: 'https://www.facebook.com/', snippet: 'Connect with friends and the world around you.' },
    { title: 'WhatsApp', url: 'https://www.whatsapp.com/', snippet: 'Simple. Secure. Reliable messaging.' },
    { title: 'Instagram', url: 'https://www.instagram.com/', snippet: 'Capture and share the world’s moments.' },
    { title: 'Wikipedia — Artificial intelligence', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence', snippet: 'Artificial intelligence (AI) is intelligence demonstrated by machines.' }
  ];

  function renderActiveTab() {
    const active = $('.tab.active').dataset.tab;
    const q = (resultsQuery.value || '').trim();
    resultsMain.innerHTML = '';

    if (active === 'all') {
      const header = document.createElement('div');
      header.className = 'result';
      header.innerHTML = `<div class="url">About sample results</div><h3>Showing results for <strong>${escapeHtml(q)}</strong></h3>`;
      resultsMain.appendChild(header);
      SAMPLE.filter(r => !q || (r.title + ' ' + r.snippet).toLowerCase().includes(q.toLowerCase()))
        .forEach(r => {
          const d = document.createElement('div'); d.className = 'result';
          d.innerHTML = `<a class="url" href="${r.url}" target="_blank" rel="noopener">${r.title}</a><p>${escapeHtml(r.snippet)}</p>`;
          resultsMain.appendChild(d);
        });
    } else if (active === 'images') {
      const grid = document.createElement('div'); grid.className = 'img-grid';
      ['/300x200/?nature','/300x200/?technology','/300x200/?ai','/300x200/?kitten'].forEach(p => {
        const img = document.createElement('img');
        img.src = 'https://source.unsplash.com' + p;
        grid.appendChild(img);
      });
      resultsMain.appendChild(grid);
    } else if (active === 'news') {
      const n1 = document.createElement('div'); n1.className='result';
      n1.innerHTML = `<a class="url" href="https://www.bbc.com/news" target="_blank">BBC News</a><h3>Viral: Local cat becomes honorary mayor</h3><p>Tiny town elects feline leader; internet reacts.</p>`;
      resultsMain.appendChild(n1);
      const n2 = document.createElement('div'); n2.className='result';
      n2.innerHTML = `<a class="url" href="https://www.nytimes.com" target="_blank">NYTimes</a><h3>Startup launches new AI search</h3><p>A new search engine demo goes viral.</p>`;
      resultsMain.appendChild(n2);
    } else if (active === 'videos') {
      const grid = document.createElement('div'); grid.className = 'video-grid';
      const card = document.createElement('div'); card.className='video-card';
      card.innerHTML = `<iframe width="320" height="180" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe><div style="padding:8px;color:#000">Funny Cat Compilation</div>`;
      grid.appendChild(card);
      resultsMain.appendChild(grid);
    }
  }

  // Escape helper
  function escapeHtml(s) {
    return (s+'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // Searching: from homepage or top bar
  function doSearch() {
    // if homepage query available use it, else top bar
    const q = (homeQuery && homeQuery.value.trim()) || (resultsQuery && resultsQuery.value.trim());
    if (!q) return;
    // switch to results page
    document.getElementById('home-page').style.display = 'none';
    resultsPage.style.display = 'block';
    resultsQuery.value = q;
    // activate All tab
    $$('.tab').forEach(b => b.classList.remove('active'));
    document.querySelector('.tab[data-tab="all"]').classList.add('active');
    renderActiveTab();
    // clear suggestions
    homeSuggestions && homeSuggestions.classList.add('hidden');
  }

  function doSearchFromTop() {
    doSearch();
  }

  // voice helper fallback detection for Safari/Firefox
  function supportsSpeech() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // init instances on load
  document.addEventListener('DOMContentLoaded', function () {
    // init home/results if elements exist
    initHome();
    initResults();

    // wire search buttons (home)
    $('#search-btn')?.addEventListener('click', doSearch);

    // enable share link if file hosted (makes URL shareable)
    // shareWhatsApp is handled earlier
  });

  // expose small API for debugging in console
  window.AiLK = {
    doSearch,
    renderActiveTab
  };
})();
