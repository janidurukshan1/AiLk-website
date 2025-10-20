// ===== AiLK Search Engine – app.js =====

// --- Get elements ---
const searchBox = document.getElementById('searchBox');
const searchBtn = document.getElementById('searchBtn');
const modeToggle = document.getElementById('modeToggle');
const signInBtn = document.getElementById('signInBtn');
const settingsBtn = document.getElementById('settingsBtn');

// --- Theme Toggle ---
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  modeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

// --- Sign In ---
signInBtn.addEventListener('click', () => {
  alert('Sign in successful! Redirecting to customization options...');
});

// --- Settings ---
settingsBtn.addEventListener('click', () => {
  alert('Settings will be available soon! Stay tuned for AiLK customization options.');
});

// --- Info Pages ---
document.getElementById('about').addEventListener('click', () => {
  alert('About AiLK:\nThis is a modern AI-powered search platform where you can explore more information quickly and easily.');
});
document.getElementById('privacy').addEventListener('click', () => {
  alert('Privacy Policy:\nAiLK respects your privacy and never stores your personal data.');
});
document.getElementById('terms').addEventListener('cli
