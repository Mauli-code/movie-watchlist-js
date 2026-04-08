const API_KEY = "373c7a1f";
const API_URL = "https://www.omdbapi.com/";

let searchedMovies = [];
let currentSearchText = "";
let visibleMovies = [];
let currentSearchPage = 1;
let hasMoreSearchResults = false;
let isLoadingMoreResults = false;
let searchRequestToken = 0;
let totalSearchResults = 0;
let movieScrollObserver = null;
let infiniteScrollFallbackRunning = false;

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
const moviesScrollSentinelElement = document.getElementById("moviesScrollSentinel");
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

function updateInfiniteScrollState() {
  if (!moviesScrollSentinelElement) return;

  const shouldShowSentinel = searchedMovies.length > 0 && hasMoreSearchResults;
  moviesScrollSentinelElement.style.display = shouldShowSentinel ? "block" : "none";

  if (!movieScrollObserver) return;
  movieScrollObserver.disconnect();

  if (shouldShowSentinel) {
    movieScrollObserver.observe(moviesScrollSentinelElement);
  }
}

function ensureInfiniteScrollObserver() {
  if (!moviesScrollSentinelElement || movieScrollObserver) return;

  movieScrollObserver = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (!entry?.isIntersecting) return;
    loadMoreMovies();
  }, {
    root: null,
    rootMargin: "300px 0px",
    threshold: 0.1,
  });
}

function isNearPageBottom() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const pageHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  );

  return scrollTop + viewportHeight >= pageHeight - 400;
}

function runInfiniteScrollFallback() {
  if (infiniteScrollFallbackRunning) return;
  infiniteScrollFallbackRunning = true;

  requestAnimationFrame(() => {
    infiniteScrollFallbackRunning = false;

    if (!currentSearchText || !hasMoreSearchResults || isLoadingMoreResults) return;
    if (!isNearPageBottom()) return;

    loadMoreMovies();
  });
}

function dedupeMovies(movieList) {
  const seenIds = new Set();
  const uniqueMovies = [];

  movieList.forEach((movie) => {
    if (!movie?.imdbID || seenIds.has(movie.imdbID)) return;
    seenIds.add(movie.imdbID);
    uniqueMovies.push(movie);
  });

  return uniqueMovies;
}

function setLoadingMoreState(isLoading) {
  isLoadingMoreResults = isLoading;
  if (!loadingIndicatorElement) return;
  loadingIndicatorElement.innerText = isLoading ? "Loading more..." : "Loading...";
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

  updateInfiniteScrollState();
}

async function fetchMoviePage(searchText, pageNumber) {
  const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchText)}&type=movie&page=${pageNumber}`);
  return response.json();
}

async function searchMovies(searchText) {
  searchRequestToken += 1;
  const activeToken = searchRequestToken;
  currentSearchText = searchText;
  currentSearchPage = 1;
  hasMoreSearchResults = false;
  totalSearchResults = 0;
  searchedMovies = [];
  visibleMovies = [];
  currentSearchPage = 1;
  loadingIndicatorElement?.classList.remove("hidden");
  errorBoxElement?.classList.add("hidden");
  resultsBarElement?.classList.add("hidden");
  noResultsElement?.classList.add("hidden");

  try {
    const responseData = await fetchMoviePage(searchText, 1);

    if (activeToken !== searchRequestToken) return;

    if (responseData.Response === "True" && responseData.Search) {
      searchedMovies = dedupeMovies(responseData.Search);
      totalSearchResults = parseInt(responseData.totalResults, 10) || searchedMovies.length;
      hasMoreSearchResults = totalSearchResults > searchedMovies.length;
      renderMoviesList();

      if (hasMoreSearchResults) {
        ensureInfiniteScrollObserver();
      }
    } else {
      searchedMovies = [];
      moviesGridElement.innerHTML = "";
      noResultsElement?.classList.remove("hidden");
      resultsBarElement?.classList.add("hidden");
      updateInfiniteScrollState();
    }
  } catch (error) {
    console.error(error);
    showError("Network error");
  } finally {
    if (activeToken === searchRequestToken) {
      loadingIndicatorElement?.classList.add("hidden");
    }
  }
}

async function loadMoreMovies() {
  if (!currentSearchText || isLoadingMoreResults || !hasMoreSearchResults) return;

  const activeToken = searchRequestToken;
  isLoadingMoreResults = true;
  loadingIndicatorElement?.classList.remove("hidden");

  try {
    const nextPageNumber = currentSearchPage + 1;
    const responseData = await fetchMoviePage(currentSearchText, nextPageNumber);

    if (activeToken !== searchRequestToken) return;

    if (responseData.Response === "True" && responseData.Search?.length) {
      currentSearchPage = nextPageNumber;
      const combinedResults = dedupeMovies([...searchedMovies, ...responseData.Search]);
      searchedMovies = combinedResults;
      hasMoreSearchResults = totalSearchResults > searchedMovies.length;
      renderMoviesList();
    } else {
      hasMoreSearchResults = false;
      updateInfiniteScrollState();
    }
  } catch (error) {
    console.error(error);
    showError("Could not load more movies");
  } finally {
    if (activeToken === searchRequestToken) {
      isLoadingMoreResults = false;
      loadingIndicatorElement?.classList.add("hidden");
    }
    updateInfiniteScrollState();
  }
}

function resetMoviesPage() {
  searchRequestToken += 1;
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
  currentSearchPage = 1;
  hasMoreSearchResults = false;
  isLoadingMoreResults = false;
  totalSearchResults = 0;
  updateInfiniteScrollState();
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

window.addEventListener("DOMContentLoaded", () => {
  ensureInfiniteScrollObserver();
  window.addEventListener("scroll", runInfiniteScrollFallback, { passive: true });
  window.addEventListener("resize", runInfiniteScrollFallback, { passive: true });

  if (searchInputElement && !searchInputElement.value.trim()) {
    searchInputElement.value = "movie";
    searchMovies("movie");
  }
});
