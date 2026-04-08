const apiKey = "373c7a1f";
const apiUrl = "https://www.omdbapi.com/";

const topIds = [
  "tt0111161", "tt0068646", "tt0468569", "tt0133093", "tt0109830",
  "tt1375666", "tt0816692", "tt0120737", "tt0120697", "tt0102926"
];

let popularMoviesCache = [];
let currentMovieResults = [];

const searchInputElement = document.getElementById("searchInput");
const searchButtonElement = document.getElementById("searchBtn");
const surpriseButtonElement = document.getElementById("surpriseBtn");
const surpriseResultElement = document.getElementById("surpriseResult");
const clearButtonElement = document.getElementById("clearBtn");
const loadingElement = document.getElementById("loader");
const errorMessageElement = document.getElementById("errorBox");
const moviesGridElement = document.getElementById("moviesGrid");
const landingSectionElement = document.getElementById("landingWrap");
const noResultsElement = document.getElementById("noResults");
const resultsBarElement = document.getElementById("resultsBar");
const resultsCountElement = document.getElementById("resultsCount");
const sortSelectElement = document.getElementById("sortSelect");
const filterSelectElement = document.getElementById("filterSelect");

function hideElement(element) {
  element?.classList.add("hidden");
}

function showElement(element) {
  element?.classList.remove("hidden");
}

function matchesYearFilter(movie) {
  const movieYear = parseInt(movie.Year, 10);
  const selectedFilter = filterSelectElement?.value;

  if (selectedFilter === "pre1990") return movieYear < 1990;
  if (selectedFilter === "1990-2009") return movieYear >= 1990 && movieYear <= 2009;
  if (selectedFilter === "2010-plus") return movieYear >= 2010;

  return true;
}

function sortMovies(movieList) {
  const selectedSort = sortSelectElement?.value;
  const sortedMovies = [...movieList];

  if (selectedSort === "year-desc") {
    sortedMovies.sort((a, b) => parseInt(b.Year, 10) - parseInt(a.Year, 10));
  }
  if (selectedSort === "year-asc") {
    sortedMovies.sort((a, b) => parseInt(a.Year, 10) - parseInt(b.Year, 10));
  }
  if (selectedSort === "az") {
    sortedMovies.sort((a, b) => a.Title.localeCompare(b.Title));
  }
  if (selectedSort === "za") {
    sortedMovies.sort((a, b) => b.Title.localeCompare(a.Title));
  }

  return sortedMovies;
}

function renderMoviesGrid() {
  const visibleMovies = sortMovies(currentMovieResults.filter(matchesYearFilter));

  if (!visibleMovies.length) {
    moviesGridElement.innerHTML = "";
    showElement(noResultsElement);
    hideElement(resultsBarElement);
    return;
  }

  hideElement(noResultsElement);
  showElement(resultsBarElement);
  if (resultsCountElement) resultsCountElement.innerText = `${visibleMovies.length} results`;

  moviesGridElement.innerHTML = "";
  visibleMovies.forEach((movie) => {
    moviesGridElement.appendChild(createMovieCard(movie));
  });
}

function showNetworkError() {
  hideElement(loadingElement);
  if (!errorMessageElement) return;
  errorMessageElement.classList.remove("hidden");
  errorMessageElement.innerHTML = "<span>Network error</span>";
  setTimeout(() => errorMessageElement.classList.add("hidden"), 3000);
}

async function searchMovies(queryText) {
  showElement(loadingElement);
  hideElement(errorMessageElement);
  moviesGridElement.innerHTML = "";
  hideElement(landingSectionElement);
  hideElement(noResultsElement);
  hideElement(resultsBarElement);

  const normalizedQuery = queryText.toLowerCase();
  const matchingPopularMovies = popularMoviesCache.filter((movie) => `${movie.Title} ${movie.Year}`.toLowerCase().includes(normalizedQuery));

  if (matchingPopularMovies.length) {
    currentMovieResults = matchingPopularMovies;
    renderMoviesGrid();
    hideElement(loadingElement);
    return;
  }

  try {
    const response = await fetch(`${apiUrl}?apikey=${apiKey}&s=${encodeURIComponent(queryText)}&type=movie`);
    const responseData = await response.json();
    hideElement(loadingElement);

    if (responseData.Response === "True" && responseData.Search) {
      currentMovieResults = responseData.Search;
      renderMoviesGrid();
    } else {
      currentMovieResults = [];
      showElement(noResultsElement);
      hideElement(resultsBarElement);
    }
  } catch {
    showNetworkError();
  }
}

async function loadPopularMovies() {
  if (popularMoviesCache.length) {
    currentMovieResults = popularMoviesCache;
    renderMoviesGrid();
    return;
  }

  showElement(loadingElement);

  const popularMovieRequests = topIds.map((movieId) => {
    return fetch(`${apiUrl}?apikey=${apiKey}&i=${movieId}`).then((response) => response.json());
  });

  const popularMovieResponses = await Promise.all(popularMovieRequests);

  popularMoviesCache = popularMovieResponses
    .filter((movieData) => movieData.Response === "True")
    .map((movieData) => ({
      imdbID: movieData.imdbID,
      Title: movieData.Title,
      Year: movieData.Year,
      Poster: movieData.Poster
    }));

  currentMovieResults = popularMoviesCache;
  renderMoviesGrid();
  hideElement(loadingElement);
}

function resetToHomeView() {
  if (filterSelectElement) filterSelectElement.value = "all";
  if (sortSelectElement) sortSelectElement.value = "default";
  loadPopularMovies();
  hideElement(resultsBarElement);
  hideElement(noResultsElement);
}

function handleSearchButtonClick() {
  const searchText = searchInputElement?.value.trim() || "";
  if (searchText.length >= 2) {
    searchMovies(searchText);
  } else {
    resetToHomeView();
  }
}

function handleSurpriseButtonClick() {
  const moviePool = currentMovieResults.length ? currentMovieResults : popularMoviesCache;
  if (!moviePool.length) {
    if (surpriseResultElement) surpriseResultElement.innerHTML = "No movies yet.";
    return;
  }

  const randomMovie = moviePool[Math.floor(Math.random() * moviePool.length)];
  if (surpriseResultElement) {
    surpriseResultElement.innerHTML = `Try: <strong>${randomMovie.Title}</strong> (${randomMovie.Year || "N/A"})`;
    surpriseResultElement.classList.remove("hidden");
  }
}

function handleClearButtonClick() {
  if (searchInputElement) searchInputElement.value = "";
  resetToHomeView();
  clearButtonElement?.classList.add("hidden");
}

function handleSearchInputChange() {
  if (!searchInputElement) return;

  if (searchInputElement.value.trim()) {
    clearButtonElement?.classList.remove("hidden");
  } else {
    clearButtonElement?.classList.add("hidden");
  }

  if (searchInputElement.value.length === 1) {
    resetToHomeView();
  }
}

searchButtonElement?.addEventListener("click", handleSearchButtonClick);
surpriseButtonElement?.addEventListener("click", handleSurpriseButtonClick);
clearButtonElement?.addEventListener("click", handleClearButtonClick);
searchInputElement?.addEventListener("input", handleSearchInputChange);
sortSelectElement?.addEventListener("change", renderMoviesGrid);
filterSelectElement?.addEventListener("change", renderMoviesGrid);

loadPopularMovies();