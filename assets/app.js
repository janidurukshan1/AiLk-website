const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const aiModeBtn = document.getElementById("aiModeBtn");
const suggestionsBox = document.getElementById("suggestions");
const doodle = document.getElementById("doodle");

const sampleSuggestions = [
  "New Year 2026 wishes",
  "AI tools",
  "ChatGPT",
  "YouTube",
  "Google",
  "Facebook",
  "WhatsApp"
];

// SEARCH
function search() {
  const q = searchInput.value.trim();
  if (!q) return;
  if (q.startsWith("http") || q.includes(".")) {
    window.location.href = q.startsWith("http") ? q : `https://${q}`;
  } else {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }
}

searchBtn.onclick = search;
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

// SUGGESTIONS
searchInput.addEventListener("input", () => {
  suggestionsBox.innerHTML = "";
  if (!searchInput.value) return;

  sampleSuggestions
    .filter(s => s.toLowerCase().includes(searchInput.value.toLowerCase()))
    .forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      li.onclick = () => {
        searchInput.value = s;
        search();
      };
      suggestionsBox.appendChild(li);
    });
});

// AI MODE
aiModeBtn.onclick = async () => {
  const q = searchInput.value;
  if (!q) return alert("Ask something first!");

  const res = await fetch("http://localhost:3000/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: q })
  });

  const data = await res.json();
  alert("🤖 AiLK AI:\n\n" + data.reply);
};

// DOODLE CLICK
doodle.onclick = () => {
  searchInput.value = "Happy New Year 2026 🎉";
  aiModeBtn.click();
};
