// storage keys for saving stuff
const WATCHLIST_STORAGE_KEY = "movieapp_list";
const THEME_STORAGE_KEY = "movieapp_theme";

let watchlist = [];    // array to store movies user added
var isDark = false;    // TODO: convert all var to let/const

// load watchlist from localStorage when page starts
function loadList() {
  let data = localStorage.getItem(WATCHLIST_STORAGE_KEY)
  if (data) {
    try {
      watchlist = JSON.parse(data);
      console.log("Loaded watchlist:", watchlist)
    } catch (e) {
      console.log("Error loading watchlist:", e)
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
  isDark = isDarkMode
  if (isDark) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.innerText = isDark ? "Light" : "Dark"
  }
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light")
}

// switch between dark and light
function toggleTheme() {
  setTheme(!isDark)
  console.log("Theme toggled:", isDark ? "dark" : "light")
}

// set up theme when page loads
function initTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  let darkMode = saved === "dark"
  setTheme(darkMode)

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", toggleTheme);
  }
}

// show toast notification at bottom right
function showMsg(msg) {
  var toast = document.getElementById("toast");  
  if (toast) {
    toast.innerText = msg;
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden")
    }, 2000);
  }
}

function escape(str) {
  if (typeof str !== "string") return "";
  let div = document.createElement("div");
  div.textContent = str
  return div.innerHTML
}

// run when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadList()
  initTheme()
  updateCount()
  console.log("Page loaded!")
});