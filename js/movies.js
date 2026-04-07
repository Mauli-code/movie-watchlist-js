const API_KEY = "373c7a1f";
const API_URL = "https://www.omdbapi.com/";

let currentMoviesList = [];
let currentMoviesSearch = "";
let currentVisibleMovies = [];

const moviesSearchInput = document.getElementById("moviesSearchInput");
const moviesSearchBtn = document.getElementById("moviesSearchBtn");
const moviesSurpriseBtn = document.getElementById("moviesSurpriseBtn");
const moviesSurpriseResult = document.getElementById("moviesSurpriseResult");
const moviesClearBtn = document.getElementById("moviesClearBtn");
const errorBox = document.getElementById("errorBox");
const resultsBar = document.getElementById("moviesResultsBar");
const moviesCount = document.getElementById("moviesCount");
const moviesFilterSelect = document.getElementById("moviesFilterSelect");
const moviesSortSelect = document.getElementById("moviesSortSelect");
const moviesGridContainer = document.getElementById("moviesGridContainer");
const moviesNoResults = document.getElementById("moviesNoResults");
const loader = document.getElementById("loader");

function filterByYear(movie) {
  const year = parseInt(movie.Year, 10);
  const filterValue = moviesFilterSelect?.value || "all";

  if (filterValue === "pre1990") return year < 1990;
  if (filterValue === "1990-2009") return year >= 1990 && year <= 2009;
  if (filterValue === "2010-plus") return year >= 2010;
  return true;
}

function sortMovies(list) {
  const sorted = [...list];
  const sortValue = moviesSortSelect?.value || "default";

  if (sortValue === "year-desc") {
    sorted.sort((a, b) => parseInt(b.Year, 10) - parseInt(a.Year, 10));
  } else if (sortValue === "year-asc") {
    sorted.sort((a, b) => parseInt(a.Year, 10) - parseInt(b.Year, 10));
  } else if (sortValue === "az") {
    sorted.sort((a, b) => a.Title.localeCompare(b.Title));
  } else if (sortValue === "za") {
    sorted.sort((a, b) => b.Title.localeCompare(a.Title));
  }

  return sorted;
}

function getVisibleMovies() {
  return sortMovies(currentMoviesList.filter(filterByYear));
}

function showError(message) {
  if (!errorBox) return;
  errorBox.classList.remove("hidden");
  errorBox.innerHTML = `<span>${message}</span>`;
  setTimeout(() => errorBox.classList.add("hidden"), 3000);
}

function renderMoviesList() {
  currentVisibleMovies = getVisibleMovies();

  if (!currentVisibleMovies.length) {
    moviesGridContainer.innerHTML = "";
    moviesNoResults?.classList.remove("hidden");
    resultsBar?.classList.add("hidden");
    return;
  }

  moviesNoResults?.classList.add("hidden");
  resultsBar?.classList.remove("hidden");
  if (moviesCount) {
    moviesCount.innerText = `${currentVisibleMovies.length} results${currentMoviesSearch ? ` for "${currentMoviesSearch}"` : ""}`;
  }

  moviesGridContainer.innerHTML = "";
  currentVisibleMovies.forEach((movie) => {
    moviesGridContainer.appendChild(createMovieCard(movie));
  });
}

async function searchMovies(query) {
  currentMoviesSearch = query;
  loader?.classList.remove("hidden");
  errorBox?.classList.add("hidden");
  resultsBar?.classList.add("hidden");
  moviesNoResults?.classList.add("hidden");

  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
    const data = await response.json();

    if (data.Response === "True" && data.Search) {
      currentMoviesList = data.Search;
      renderMoviesList();
    } else {
      currentMoviesList = [];
      moviesGridContainer.innerHTML = "";
      moviesNoResults?.classList.remove("hidden");
      resultsBar?.classList.add("hidden");
    }
  } catch (error) {
    console.error(error);
    showError("Network error");
  } finally {
    loader?.classList.add("hidden");
  }
}

function resetMovies() {
  if (moviesSearchInput) moviesSearchInput.value = "";
  if (moviesFilterSelect) moviesFilterSelect.value = "all";
  if (moviesSortSelect) moviesSortSelect.value = "default";
  moviesClearBtn?.classList.add("hidden");
  moviesNoResults?.classList.add("hidden");
  resultsBar?.classList.add("hidden");
  if (moviesGridContainer) moviesGridContainer.innerHTML = "";
  moviesSurpriseResult?.classList.add("hidden");
  if (moviesSurpriseResult) moviesSurpriseResult.innerHTML = "";
  currentMoviesList = [];
  currentVisibleMovies = [];
  currentMoviesSearch = "";
}

function handleSearch() {
  const query = moviesSearchInput?.value.trim() || "";
  if (query.length < 2) {
    resetMovies();
    return;
  }
  searchMovies(query);
}

function handleSurpriseMe() {
  const list = currentMoviesList.length > 0 ? currentMoviesList : currentVisibleMovies;

  if (!list.length) {
    if (moviesSurpriseResult) {
      moviesSurpriseResult.innerHTML = "No movies to pick yet.";
      moviesSurpriseResult.classList.remove("hidden");
    }
    return;
  }

  const randomMovie = list[Math.floor(Math.random() * list.length)];
  if (moviesSurpriseResult) {
    moviesSurpriseResult.innerHTML = `Try watching: <strong>${escape(randomMovie.Title)}</strong> (${escape(randomMovie.Year || "N/A")})`;
    moviesSurpriseResult.classList.remove("hidden");
  }
}

moviesSearchBtn?.addEventListener("click", handleSearch);
moviesSurpriseBtn?.addEventListener("click", handleSurpriseMe);
moviesClearBtn?.addEventListener("click", resetMovies);
moviesFilterSelect?.addEventListener("change", renderMoviesList);
moviesSortSelect?.addEventListener("change", renderMoviesList);

moviesSearchInput?.addEventListener("input", () => {
  if (moviesSearchInput.value.trim()) {
    moviesClearBtn?.classList.remove("hidden");
  } else {
    moviesClearBtn?.classList.add("hidden");
  }
});
