const MOVIE_API_KEY = "373c7a1f";
const MOVIE_API_URL = "https://www.omdbapi.com/";
const MOVIE_LIKES_STORAGE_KEY = "movieapp_likes";
const MOVIE_FAVORITES_STORAGE_KEY = "movieapp_favorites";

function loadIdSet(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveIdSet(storageKey, ids) {
  localStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
}

function isMovieLiked(movieId) {
  return loadIdSet(MOVIE_LIKES_STORAGE_KEY).has(movieId);
}

function isMovieFavorite(movieId) {
  return loadIdSet(MOVIE_FAVORITES_STORAGE_KEY).has(movieId);
}

function toggleMovieReaction(storageKey, movieId) {
  const ids = loadIdSet(storageKey);
  if (ids.has(movieId)) {
    ids.delete(movieId);
    saveIdSet(storageKey, ids);
    return false;
  }

  ids.add(movieId);
  saveIdSet(storageKey, ids);
  return true;
}

function createMovieCard(movie, options = {}) {
  const showDetails = options.showDetails !== false;
  const card = document.createElement("div");
  const isSaved = isInList(movie.imdbID);
  const isLiked = isMovieLiked(movie.imdbID);
  const isFavorite = isMovieFavorite(movie.imdbID);
  card.className = `movie-card ${isSaved ? "saved" : ""}`;
  card.dataset.id = movie.imdbID;

  const posterHtml = movie.Poster && movie.Poster !== "N/A"
    ? `<img class="card-poster" src="${movie.Poster}" alt="${escape(movie.Title)}" loading="lazy">`
    : `<div class="card-poster" style="background:#ddd7cc; display:flex; align-items:center; justify-content:center;">No Poster</div>`;

  const detailsPanel = showDetails
    ? '<div class="movie-details open" aria-live="polite">Loading details...</div>'
    : "";

  card.innerHTML = `
    <div class="card-poster-wrap">
      ${posterHtml}
      <button class="card-bookmark-btn" type="button" aria-label="Save movie">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
    <div class="card-body">
      <div class="card-title">${escape(movie.Title)}</div>
      <div class="card-year">${escape(movie.Year || "?")}</div>
      <div class="card-actions">
        <button class="btn-sm btn-card-save" type="button">${isSaved ? "✓ Saved" : "+ Watchlist"}</button>
        <button class="btn-sm btn-like ${isLiked ? "active" : ""}" type="button" aria-pressed="${isLiked}">${isLiked ? "Liked" : "Like"}</button>
        <button class="btn-sm btn-favorite ${isFavorite ? "active" : ""}" type="button" aria-pressed="${isFavorite}">${isFavorite ? "Favorited" : "Favorite"}</button>
      </div>
      ${detailsPanel}
    </div>
  `;

  const saveBtn = card.querySelector(".btn-card-save");
  const likeBtn = card.querySelector(".btn-like");
  const favoriteBtn = card.querySelector(".btn-favorite");
  const bookmarkBtn = card.querySelector(".card-bookmark-btn");

  saveBtn?.addEventListener("click", () => toggleMovieWatchlist(movie, card));
  likeBtn?.addEventListener("click", () => toggleLike(movie, likeBtn));
  favoriteBtn?.addEventListener("click", () => toggleFavorite(movie, favoriteBtn));
  bookmarkBtn?.addEventListener("click", () => toggleMovieWatchlist(movie, card));

  if (showDetails) {
    loadMovieDetails(movie, card);
  }

  return card;
}

function toggleMovieWatchlist(movie, cardElement) {
  if (isInList(movie.imdbID)) {
    removeFromList(movie.imdbID);
    cardElement.classList.remove("saved");
    showMsg(`Removed: ${movie.Title}`);
  } else {
    addToList(movie);
    cardElement.classList.add("saved");
    showMsg(`Added: ${movie.Title}`);
  }

  const isSaved = isInList(movie.imdbID);
  const saveBtn = cardElement.querySelector(".btn-card-save");
  const icon = cardElement.querySelector(".card-bookmark-btn svg");

  if (saveBtn) saveBtn.innerText = isSaved ? "✓ Saved" : "+ Watchlist";
  if (icon) icon.setAttribute("fill", isSaved ? "currentColor" : "none");
  updateCount();
}

async function loadMovieDetails(movie, cardElement) {
  const panel = cardElement.querySelector(".movie-details");
  if (!panel) return;

  if (panel.dataset.loaded === "true") return;

  panel.innerHTML = "Loading details...";

  try {
    const response = await fetch(`${MOVIE_API_URL}?apikey=${MOVIE_API_KEY}&i=${movie.imdbID}&plot=full`);
    const data = await response.json();

    if (data.Response !== "True") {
      throw new Error("Movie not found");
    }

    panel.innerHTML = `
      <p><strong>Runtime:</strong> ${escape(data.Runtime || "N/A")}</p>
      <p><strong>Genre:</strong> ${escape(data.Genre || "N/A")}</p>
      <p><strong>Director:</strong> ${escape(data.Director || "N/A")}</p>
      <p class="details-plot">${escape(data.Plot || "No description available.")}</p>
    `;
    panel.dataset.loaded = "true";
  } catch (error) {
    console.error("Failed to load details:", error);
    panel.innerHTML = "Could not load details right now.";
  }
}

function toggleLike(movie, buttonElement) {
  const liked = toggleMovieReaction(MOVIE_LIKES_STORAGE_KEY, movie.imdbID);
  buttonElement.classList.toggle("active", liked);
  buttonElement.setAttribute("aria-pressed", liked ? "true" : "false");
  buttonElement.innerText = liked ? "Liked" : "Like";
  showMsg(liked ? `Liked: ${movie.Title}` : `Unliked: ${movie.Title}`);
}

function toggleFavorite(movie, buttonElement) {
  const favorited = toggleMovieReaction(MOVIE_FAVORITES_STORAGE_KEY, movie.imdbID);
  buttonElement.classList.toggle("active", favorited);
  buttonElement.setAttribute("aria-pressed", favorited ? "true" : "false");
  buttonElement.innerText = favorited ? "Favorited" : "Favorite";
  showMsg(favorited ? `Favorited: ${movie.Title}` : `Removed favorite: ${movie.Title}`);
}
