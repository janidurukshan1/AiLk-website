const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const suggestions = document.getElementById("suggestions");

const sampleSuggestions = [
  "Weather today",
  "YouTube",
  "Facebook",
  "AiLK Search Engine",
  "GitHub",
  "Google Maps"
];

searchInput.addEventListener("input", () => {
  suggestions.innerHTML = "";
  if (!searchInput.value) return;

  sampleSuggestions.forEach(item => {
    if (item.toLowerCase().includes(searchInput.value.toLowerCase())) {
      const li = document.createElement("li");
      li.textContent = item;
      li.onclick = () => doSearch(item);
      suggestions.appendChild(li);
    }
  });
});

searchBtn.onclick = () => doSearch(searchInput.value);

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") doSearch(searchInput.value);
});

function doSearch(query) {
  if (!query) return;
  window.location.href =
    "https://www.google.com/search?q=" + encodeURIComponent(query);
}

/* ACCOUNT MENU */
const accountBtn = document.getElementById("accountBtn");
const accountMenu = document.getElementById("accountMenu");

accountBtn.onclick = () => {
  accountMenu.style.display =
    accountMenu.style.display === "block" ? "none" : "block";
};

document.addEventListener("click", e => {
  if (!accountBtn.contains(e.target)) {
    accountMenu.style.display = "none";
  }
});
