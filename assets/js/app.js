const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  // Redirect to REAL Google results
  const url = "https://www.google.com/search?q=" + encodeURIComponent(query);
  window.location.href = url;
});

function openShortcut(url) {
  window.open(url, "_blank");
}

// Fake account system (frontend only)
document.getElementById("accountBtn").onclick = () => {
  if (localStorage.getItem("ailkUser")) {
    localStorage.removeItem("ailkUser");
    alert("Signed out successfully");
  } else {
    localStorage.setItem("ailkUser", "loggedin");
    alert("Signed in successfully");
  }
};

  searchInput.value = "Happy New Year 2026 🎉";
  aiModeBtn.click();
};
