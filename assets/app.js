// ===== AiLK Search Engine – app.js (FINAL FIXED) =====

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
  alert('About AiLK:\nThis is a website that helps you explore information using AI-powered search results.');
});
document.getElementById('privacy').addEventListener('click', () => {
  alert('Privacy Policy:\nWe respect your privacy. AiLK does not store or share your search queries.');
});
document.getElementById('terms').addEventListener('click', () => {
  alert('Terms of Use:\nUse AiLK responsibly. Results are powered by Google Search.');
});

// === Settings and Sign-in ===
signInBtn.addEventListener('click', () => {
  alert('Sign in successful!\nYou can now access customization options soon.');
});

settingsBtn.addEventListener('click', () => {
  alert('Settings feature is under development. You will be able to personalize AiLK here.');
});

// === Perform Search ===
function performSearch() {
  const query = searchBox.value.trim();
  if (!query) {
    alert('Please type something to search.');
    return;
  }

  // If it looks like a URL → open directly
  if (query.startsWith('http://') || query.startsWith('https://') || query.includes('.com')) {
    window.location.href = query.startsWith('http') ? query : `https://${query}`;
  } else {
    // Else, search on Google
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.location.href = googleUrl;
  }
}

// === Event: Button Click ===
searchBtn.addEventListener('click', performSearch);

// === Event: Press Enter / Android Search ===
searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === 'Search' || e.key === 'Go' || e.key === 'Done') {
    e.preventDefault();
    performSearch();
  }
});

// Autofocus when loaded
window.addEventListener('load', () => searchBox.focus());
