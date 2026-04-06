const apiKey = "373c7a1f";
const apiUrl = "https://www.omdbapi.com/";

const popularIds = [
  "tt0111161", "tt0068646", "tt0468569", "tt0133093", "tt0109830",
  "tt1375666", "tt0816692", "tt0120737", "tt0120697", "tt0102926"
];

let popularMovies = [];
let filteredData = [];

const searchBox = document.getElementById("searchInput");
const searchButton = document.getElementById("searchBtn");
const surpriseBtn = document.getElementById("surpriseBtn");
const surpriseResult = document.getElementById("surpriseResult");
const clearBtn = document.getElementById("clearBtn");
const loader = document.getElementById("loader");
const errorMsg = document.getElementById("errorBox");
const moviesContainer = document.getElementById("moviesGrid");
const landingSection = document.getElementById("landingWrap");
const noResultsText = document.getElementById("noResults");
const resultsBar = document.getElementById("resultsBar");
const resultCount = document.getElementById("resultsCount");
const sortDropdown = document.getElementById("sortSelect");
const filterDropdown = document.getElementById("filterSelect");

function hide(el) { el?.classList.add("hidden"); }
function show(el) { el?.classList.remove("hidden"); }

function getFilteredMovies(movie) {
  const year = parseInt(movie.Year, 10);
  const filter = filterDropdown?.value;
  if (filter === "pre1990") return year < 1990;
  if (filter === "1990-2009") return year >= 1990 && year <= 2009;
  if (filter === "2010-plus") return year >= 2010;
  return true;
}

function getSortedMovies(movies) {
  const sorted = [...movies];
  const sortBy = sortDropdown?.value;
  if (sortBy === "year-desc") sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  if (sortBy === "year-asc") sorted.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  if (sortBy === "az") sorted.sort((a, b) => a.Title.localeCompare(b.Title));
  if (sortBy === "za") sorted.sort((a, b) => b.Title.localeCompare(a.Title));
  return sorted;
}

function renderMovies() {
  const visible = getSortedMovies(filteredData.filter(getFilteredMovies));
  
  if (!visible.length) {
    moviesContainer.innerHTML = "";
    show(noResultsText);
    hide(resultsBar);
    return;
  }
  
  hide(noResultsText);
  show(resultsBar);
  if (resultCount) resultCount.innerText = `${visible.length} results`;
  
  moviesContainer.innerHTML = "";
  visible.forEach(m => moviesContainer.appendChild(createMovieCard(m)));
}

async function searchAPI(query) {
  show(loader);
  hide(errorMsg);
  moviesContainer.innerHTML = "";
  hide(landingSection);
  hide(noResultsText);
  hide(resultsBar);

  const cached = popularMovies.filter(m => `${m.Title} ${m.Year}`.toLowerCase().includes(query.toLowerCase()));
  
  if (cached.length) {
    filteredData = cached;
    renderMovies();
    hide(loader);
    return;
  }

  try {
    const res = await fetch(`${apiUrl}?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`);
    const data = await res.json();
    hide(loader);
    
    if (data.Response === "True" && data.Search) {
      filteredData = data.Search;
      renderMovies();
    } else {
      filteredData = [];
      show(noResultsText);
      hide(resultsBar);
    }
  } catch {
    hide(loader);
    errorMsg.classList.remove("hidden");
    errorMsg.innerHTML = "<span>Network error</span>";
    setTimeout(() => errorMsg.classList.add("hidden"), 3000);
  }
}

async function loadPopular() {
  if (popularMovies.length) {
    filteredData = popularMovies;
    renderMovies();
    return;
  }
  
  show(loader);
  const requests = popularIds.map(id => fetch(`${apiUrl}?apikey=${apiKey}&i=${id}`).then(r => r.json()));
  const results = await Promise.all(requests);
  
  popularMovies = results.filter(r => r.Response === "True").map(r => ({
    imdbID: r.imdbID, Title: r.Title, Year: r.Year, Poster: r.Poster
  }));
  
  filteredData = popularMovies;
  renderMovies();
  hide(loader);
}

function resetToHome() {
  if (filterDropdown) filterDropdown.value = "all";
  if (sortDropdown) sortDropdown.value = "default";
  loadPopular();
  hide(resultsBar);
  hide(noResultsText);
}

searchButton?.addEventListener("click", () => {
  const q = searchBox?.value.trim();
  q.length >= 2 ? searchAPI(q) : resetToHome();
});

surpriseBtn?.addEventListener("click", () => {
  const list = filteredData.length ? filteredData : popularMovies;
  if (!list.length) {
    if (surpriseResult) surpriseResult.innerHTML = "No movies yet.";
    return;
  }
  const random = list[Math.floor(Math.random() * list.length)];
  if (surpriseResult) {
    surpriseResult.innerHTML = `Try: <strong>${random.Title}</strong> (${random.Year || "N/A"})`;
    surpriseResult.classList.remove("hidden");
  }
});

clearBtn?.addEventListener("click", () => {
  if (searchBox) searchBox.value = "";
  resetToHome();
  clearBtn?.classList.add("hidden");
});

searchBox?.addEventListener("input", () => {
  searchBox.value.trim() ? clearBtn?.classList.remove("hidden") : clearBtn?.classList.add("hidden");
  if (searchBox.value.length === 1) resetToHome();
});

sortDropdown?.addEventListener("change", renderMovies);
filterDropdown?.addEventListener("change", renderMovies);

loadPopular();