const MOVIE_API_KEY = "373c7a1f";
const MOVIE_API_URL = "https://www.omdbapi.com/";

function createMovieCard(movie, options = {}) {
  const showDetails = options.showDetails !== false;
  const card = document.createElement("div");
  const isSaved = isInList(movie.imdbID);
  card.className = `movie-card ${isSaved ? "saved" : ""}`;
  card.dataset.id = movie.imdbID;

  const posterHtml = movie.Poster && movie.Poster !== "N/A"
    ? `<img class="card-poster" src="${movie.Poster}" alt="${escape(movie.Title)}" loading="lazy">`
    : `<div class="card-poster" style="background:#ddd7cc; display:flex; align-items:center; justify-content:center;">No Poster</div>`;

  const detailsButton = showDetails
    ? '<button class="btn-sm btn-details" type="button">Details</button>'
    : "";

  const detailsPanel = showDetails
    ? '<div class="movie-details" aria-live="polite"></div>'
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
        ${detailsButton}
      </div>
      ${detailsPanel}
    </div>
  `;

  const saveBtn = card.querySelector(".btn-card-save");
  const bookmarkBtn = card.querySelector(".card-bookmark-btn");
  const detailsBtn = card.querySelector(".btn-details");

  saveBtn?.addEventListener("click", () => toggleMovieWatchlist(movie, card));
  bookmarkBtn?.addEventListener("click", () => toggleMovieWatchlist(movie, card));
  detailsBtn?.addEventListener("click", () => toggleMovieDetails(movie, card, detailsBtn));

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

async function toggleMovieDetails(movie, cardElement, detailsBtn) {
  const panel = cardElement.querySelector(".movie-details");
  if (!panel || !detailsBtn) return;

  if (panel.classList.contains("open")) {
    panel.classList.remove("open");
    detailsBtn.innerText = "Details";
    return;
  }

  panel.classList.add("open");
  detailsBtn.innerText = "Hide Details";

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
