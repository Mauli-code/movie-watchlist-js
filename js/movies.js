const API_KEY = "373c7a1f";
const API_URL = "https://www.omdbapi.com/";

let searchedMovies = [];
let currentSearchText = "";
let visibleMovies = [];

const searchInputElement = document.getElementById("moviesSearchInput");
const searchButtonElement = document.getElementById("moviesSearchBtn");
const surpriseButtonElement = document.getElementById("moviesSurpriseBtn");
const surpriseResultElement = document.getElementById("moviesSurpriseResult");
const clearButtonElement = document.getElementById("moviesClearBtn");
const errorBoxElement = document.getElementById("errorBox");
const resultsBarElement = document.getElementById("moviesResultsBar");
const resultsCountElement = document.getElementById("moviesCount");
const filterSelectElement = document.getElementById("moviesFilterSelect");
const sortSelectElement = document.getElementById("moviesSortSelect");
const moviesGridElement = document.getElementById("moviesGridContainer");
const noResultsElement = document.getElementById("moviesNoResults");
const loadingIndicatorElement = document.getElementById("loader");

function matchesYearFilter(movie) {
  const movieYear = parseInt(movie.Year, 10);
  const selectedFilterValue = filterSelectElement?.value || "all";

  if (selectedFilterValue === "pre1990") return movieYear < 1990;
  if (selectedFilterValue === "1990-2009") return movieYear >= 1990 && movieYear <= 2009;
  if (selectedFilterValue === "2010-plus") return movieYear >= 2010;
  return true;
}

function sortMovieResults(movieList) {
  const sortedMovies = [...movieList];
  const selectedSortValue = sortSelectElement?.value || "default";

  if (selectedSortValue === "year-desc") {
    sortedMovies.sort((a, b) => parseInt(b.Year, 10) - parseInt(a.Year, 10));
  } else if (selectedSortValue === "year-asc") {
    sortedMovies.sort((a, b) => parseInt(a.Year, 10) - parseInt(b.Year, 10));
  } else if (selectedSortValue === "az") {
    sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
  } else if (selectedSortValue === "za") {
    sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
  }

  return sortedMovies;
}

function getVisibleMovies() {
  return sortMovieResults(searchedMovies.filter(matchesYearFilter));
}

function showError(message) {
  if (!errorBoxElement) return;
  errorBoxElement.classList.remove("hidden");
  errorBoxElement.innerHTML = `<span>${message}</span>`;
  setTimeout(() => errorBoxElement.classList.add("hidden"), 3000);
}

function renderMoviesList() {
  visibleMovies = getVisibleMovies();

  if (!visibleMovies.length) {
    moviesGridElement.innerHTML = "";
    noResultsElement?.classList.remove("hidden");
    resultsBarElement?.classList.add("hidden");
    return;
  }

  noResultsElement?.classList.add("hidden");
  resultsBarElement?.classList.remove("hidden");
  if (resultsCountElement) {
    resultsCountElement.innerText = `${visibleMovies.length} results${currentSearchText ? ` for "${currentSearchText}"` : ""}`;
  }

  moviesGridElement.innerHTML = "";
  visibleMovies.forEach((movie) => {
    moviesGridElement.appendChild(createMovieCard(movie));
  });
}

async function searchMovies(searchText) {
  currentSearchText = searchText;
  loadingIndicatorElement?.classList.remove("hidden");
  errorBoxElement?.classList.add("hidden");
  resultsBarElement?.classList.add("hidden");
  noResultsElement?.classList.add("hidden");

  try {
    const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchText)}&type=movie`);
    const responseData = await response.json();

    if (responseData.Response === "True" && responseData.Search) {
      searchedMovies = responseData.Search;
      renderMoviesList();
    } else {
      searchedMovies = [];
      moviesGridElement.innerHTML = "";
      noResultsElement?.classList.remove("hidden");
      resultsBarElement?.classList.add("hidden");
    }
  } catch (error) {
    console.error(error);
    showError("Network error");
  } finally {
    loadingIndicatorElement?.classList.add("hidden");
  }
}

function resetMoviesPage() {
  if (searchInputElement) searchInputElement.value = "";
  if (filterSelectElement) filterSelectElement.value = "all";
  if (sortSelectElement) sortSelectElement.value = "default";
  clearButtonElement?.classList.add("hidden");
  noResultsElement?.classList.add("hidden");
  resultsBarElement?.classList.add("hidden");
  if (moviesGridElement) moviesGridElement.innerHTML = "";
  surpriseResultElement?.classList.add("hidden");
  if (surpriseResultElement) surpriseResultElement.innerHTML = "";
  searchedMovies = [];
  visibleMovies = [];
  currentSearchText = "";
}

function handleSearchClick() {
  const searchText = searchInputElement?.value.trim() || "";
  if (searchText.length < 2) {
    resetMoviesPage();
    return;
  }
  searchMovies(searchText);
}

function handleSurpriseClick() {
  const candidateMovies = searchedMovies.length > 0 ? searchedMovies : visibleMovies;

  if (!candidateMovies.length) {
    if (surpriseResultElement) {
      surpriseResultElement.innerHTML = "No movies to pick yet.";
      surpriseResultElement.classList.remove("hidden");
    }
    return;
  }

  const randomMovie = candidateMovies[Math.floor(Math.random() * candidateMovies.length)];
  if (surpriseResultElement) {
    surpriseResultElement.innerHTML = `Try watching: <strong>${escape(randomMovie.Title)}</strong> (${escape(randomMovie.Year || "N/A")})`;
    surpriseResultElement.classList.remove("hidden");
  }
}

searchButtonElement?.addEventListener("click", handleSearchClick);
surpriseButtonElement?.addEventListener("click", handleSurpriseClick);
clearButtonElement?.addEventListener("click", resetMoviesPage);
filterSelectElement?.addEventListener("change", renderMoviesList);
sortSelectElement?.addEventListener("change", renderMoviesList);

searchInputElement?.addEventListener("input", () => {
  if (searchInputElement.value.trim()) {
    clearButtonElement?.classList.remove("hidden");
  } else {
    clearButtonElement?.classList.add("hidden");
  }
});
