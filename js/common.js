// storage keys for saving stuff
const WATCHLIST_STORAGE_KEY = "movieapp_list";
const THEME_STORAGE_KEY = "movieapp_theme";

let watchlist = [];    // array to store movies user added
let isDarkThemeEnabled = false;

// load watchlist from localStorage when page starts
function loadList() {
  const storedWatchlistData = localStorage.getItem(WATCHLIST_STORAGE_KEY)
  if (storedWatchlistData) {
    try {
      watchlist = JSON.parse(storedWatchlistData);
      console.log("Loaded watchlist:", watchlist)
    } catch (error) {
      console.log("Error loading watchlist:", error)
      watchlist = [];
    }
  }
}

// save watchlist to localStorage
function saveList() {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist))
  console.log("Watchlist saved")
}

// check if movie is already in watchlist
function isInList(id) {
  // using .some() because it returns true/false
  return watchlist.some((movie) => movie.imdbID === id)
}

function addToList(movie) {
  if (!isInList(movie.imdbID)) {
    watchlist.push(movie)  // add movie to array
    saveList()
    console.log("Added:", movie.Title)
  }
}

// remove from watchlist by id
function removeFromList(id) {
  watchlist = watchlist.filter((m) => m.imdbID !== id)
  saveList()
}

// update the counter in navbar
function updateCount() {
  const navCount = document.getElementById("navWlCount");
  if (navCount) {
    navCount.innerText = watchlist.length  // show how many movies
  }
}

// set theme to light or dark
function setTheme(isDarkMode) {
  isDarkThemeEnabled = isDarkMode
  if (isDarkThemeEnabled) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }

  const themeToggleButton = document.getElementById("themeToggle");
  if (themeToggleButton) {
    themeToggleButton.innerText = isDarkThemeEnabled ? "Light" : "Dark"
  }
  localStorage.setItem(THEME_STORAGE_KEY, isDarkThemeEnabled ? "dark" : "light")
}

// switch between dark and light
function toggleTheme() {
  setTheme(!isDarkThemeEnabled)
  console.log("Theme toggled:", isDarkThemeEnabled ? "dark" : "light")
}

// set up theme when page loads
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  const shouldUseDarkMode = savedTheme === "dark"
  setTheme(shouldUseDarkMode)

  const themeToggleButton = document.getElementById("themeToggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
  }
}

// show toast notification at bottom right
function showMsg(msg) {
  const toastElement = document.getElementById("toast");
  if (toastElement) {
    toastElement.innerText = msg;
    toastElement.classList.remove("hidden");
    setTimeout(() => {
      toastElement.classList.add("hidden")
    }, 2000);
  }
}

function escape(str) {
  if (typeof str !== "string") return "";
  const tempContainer = document.createElement("div");
  tempContainer.textContent = str
  return tempContainer.innerHTML
}

// run when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadList()
  initTheme()
  updateCount()
  console.log("Page loaded!")
});