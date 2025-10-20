// ===== AiLK Search Engine – app.js =====

// Select DOM elements
const searchBox = document.getElementById('searchBox');
const searchBtn = document.getElementById('searchBtn');
const modeToggle = document.getElementById('modeToggle');
const signInBtn = document.getElementById('signInBtn');
const settingsBtn = document.getElementById('settingsBtn');

// === Dark / Light Mode ===
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  modeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// === Info Pages ===
document.getElementById('about').addEventListener('click', () => {
  alert('About AiLK:\nThis is a website that helps you explore information using AI-powered search results and fast Google queries.');
});
document.getElementById('privacy').addEventListener('click', () => {
  alert('Privacy Policy:\nWe value your privacy. AiLK does not store your search history or data.');
});
document.getElementById('terms').addEventListener('click', () => {
  alert('Terms of Use:\nUse AiLK for personal exploration. Results come from Google.');
});

// === Settings & Sign In ===
signInBtn.addEventListener('click', () => {
  alert('Sign in successful! You can now personalize your AiLK experience.');
});

settingsBtn.addEventListener('click', () => {
  alert('Customization coming soon! Stay tuned for personalized search themes and history.');
});

// === Perform Search ===
function performSearch() {
  const query = searchBox.value.trim();
  if (!query) {
    alert('Please type something to search.');
    return;
  }

  if (query.startsWith('http://') || query.startsWith('https://') || query.includes('.com')) {
    window.location.href = query.startsWith('http') ? query : `https://${query}`;
  } else {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
}

// === Search Events ===
searchBtn.addEventListener('click', performSearch);
searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === 'Search' || e.key === 'Go' || e.key === 'Done') {
    e.preventDefault();
    performSearch();
  }
});
