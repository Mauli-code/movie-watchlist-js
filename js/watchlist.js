const watchlistGridElement = document.getElementById("wlGrid")
const watchlistEmptyStateElement = document.getElementById("wlEmptyState")
const watchlistActionsElement = document.getElementById("wlActions")
const watchlistCountElement = document.getElementById("wlCount")
const randomPickButton = document.getElementById("randomBtn")
const clearAllButton = document.getElementById("clearAllBtn")
const likedMoviesListElement = document.getElementById("likedMoviesList")
const favoriteMoviesListElement = document.getElementById("favoriteMoviesList")
const likedMoviesEmptyElement = document.getElementById("likedEmpty")
const favoriteMoviesEmptyElement = document.getElementById("favoriteEmpty")

const MOVIE_API_KEY = "373c7a1f"
const MOVIE_API_URL = "https://www.omdbapi.com/"
const MOVIE_LIKES_STORAGE_KEY = "movieapp_likes"
const MOVIE_FAVORITES_STORAGE_KEY = "movieapp_favorites"

function renderWatchlist() {
  console.log("Rendering watchlist with", watchlist.length, "movies")
  
  watchlistGridElement.innerHTML = ""
  
  if (watchlist.length === 0) {
    watchlistEmptyStateElement.classList.remove("hidden")
    watchlistActionsElement.classList.add("hidden")
    return
  }

  watchlistEmptyStateElement.classList.add("hidden")
  watchlistActionsElement.classList.remove("hidden")
  watchlistCountElement.innerText = watchlist.length

  watchlist.forEach(function(movieItem) {
    const watchlistCardElement = createWatchlistCard(movieItem)
    watchlistGridElement.appendChild(watchlistCardElement)
  })
}

function createWatchlistCard(movie) {
  const cardElement = document.createElement("div")
  const isMovieSaved = isInList(movie.imdbID)
  cardElement.className = `movie-card ${isMovieSaved ? "saved" : ""}`
  cardElement.dataset.id = movie.imdbID

  let posterHtml = ""
  if (movie.Poster && movie.Poster !== "N/A") {
    posterHtml = `<img class="card-poster" src="${movie.Poster}" alt="${movie.Title}" loading="lazy">`
  } else {
    posterHtml = `<div class="card-poster" style="background: #334155; display: flex; align-items: center; justify-content: center;">No Poster</div>`
  }

  cardElement.innerHTML = `
    <div class="card-poster-wrap">
      ${posterHtml}
      <button class="card-bookmark-btn" data-id="${movie.imdbID}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isMovieSaved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
    <div class="card-body">
      <div class="card-title">${escape(movie.Title)}</div>
      <div class="card-year">${movie.Year || "?"}</div>
      <div class="card-actions">
        <button class="btn-sm btn-card-save">${isMovieSaved ? "✓ Saved" : "+ Watchlist"}</button>
      </div>
    </div>
  `

  const watchlistButton = cardElement.querySelector(".btn-card-save")
  const bookmarkButton = cardElement.querySelector(".card-bookmark-btn")

  watchlistButton.addEventListener("click", (event) => {
    event.stopPropagation()
    toggleMovieInWatchlist(movie, cardElement)
  })

  bookmarkButton.addEventListener("click", (event) => {
    event.stopPropagation()
    toggleMovieInWatchlist(movie, cardElement)
  })

  return cardElement
}

function toggleMovieInWatchlist(movie, cardElement) {
  if (isInList(movie.imdbID)) {
    removeFromList(movie.imdbID)
    if (cardElement) {
      cardElement.classList.remove("saved")
    }
    showMsg(`Removed ${movie.Title}`)
    console.log("Removed from watchlist")
  } else {
    addToList(movie)
    if (cardElement) {
      cardElement.classList.add("saved")
    }
    showMsg(`Added ${movie.Title}`)
    console.log("Added to watchlist")
  }

  if (cardElement) {
    const watchlistButton = cardElement.querySelector(".btn-card-save")
    if (watchlistButton) {
      watchlistButton.innerText = isInList(movie.imdbID) ? "✓ Saved" : "+ Watchlist"
    }
    const bookmarkIcon = cardElement.querySelector(".card-bookmark-btn svg")
    if (bookmarkIcon) {
      bookmarkIcon.setAttribute("fill", isInList(movie.imdbID) ? "currentColor" : "none")
    }
  }

  updateCount()
  renderWatchlist()
  renderLikedAndFavoriteSections()
}

function clearAllWatchlistMovies() {
  watchlist = []
  saveList()
  localStorage.removeItem(WATCHLIST_STORAGE_KEY)
  renderWatchlist()
  updateCount()
  showMsg("Watchlist cleared")
  console.log("Cleared watchlist")
  renderLikedAndFavoriteSections()
}

function resetClearAllButtonState() {
  if (!clearAllButton) return
  clearAllButton.dataset.confirm = "no"
  clearAllButton.innerText = "Clear All"
}

randomPickButton?.addEventListener("click", () => {
  if (watchlist.length === 0) {
    console.log("Watchlist is empty!")
    showMsg("Watchlist is empty")
    return
  }

  const randomIndex = Math.floor(Math.random() * watchlist.length)
  const randomMovieItem = watchlist[randomIndex]
  
  console.log("Random pick:", randomMovieItem.Title)
  showMsg(`Try: ${randomMovieItem.Title}`)
})

clearAllButton?.addEventListener("click", () => {
  if (watchlist.length === 0) {
    showMsg("Watchlist is already empty")
    return
  }

  if (clearAllButton.dataset.confirm !== "yes") {
    clearAllButton.dataset.confirm = "yes"
    clearAllButton.innerText = "Confirm Clear"
    showMsg("Click again to clear all")
    setTimeout(resetClearAllButtonState, 3000)
    return
  }

  if (clearAllButton.dataset.confirm === "yes") {
    clearAllWatchlistMovies()
    resetClearAllButtonState()
  }
})

function showErrorBox(message) {
  const errorBoxElement = document.getElementById("errorBox")
  if (!errorBoxElement) {
    console.log("Error:", message)
    return
  }
  errorBoxElement.classList.remove("hidden")
  errorBoxElement.innerHTML = `<span>${message}</span>`
  setTimeout(() => {
    errorBoxElement.classList.add("hidden")
  }, 3000)
}

function getStoredMovieIds(storageKey) {
  try {
    const rawValue = localStorage.getItem(storageKey)
    const parsedValue = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function removeMovieIdFromStorage(storageKey, movieId) {
  const currentIds = getStoredMovieIds(storageKey)
  const updatedIds = currentIds.filter((savedMovieId) => savedMovieId !== movieId)
  localStorage.setItem(storageKey, JSON.stringify(updatedIds))
}

function createMiniMovieCard(movie, storageKey) {
  const miniCardElement = document.createElement("article")
  miniCardElement.className = "mini-card"

  const posterHtml = movie.Poster && movie.Poster !== "N/A"
    ? `<img class="mini-poster" src="${movie.Poster}" alt="${escape(movie.Title)}" loading="lazy">`
    : `<div class="mini-poster no-poster">No Poster</div>`

  miniCardElement.innerHTML = `
    ${posterHtml}
    <div class="mini-meta">
      <h4>${escape(movie.Title || "Unknown")}</h4>
      <p>${escape(movie.Year || "N/A")}</p>
    </div>
    <button class="mini-remove-btn" type="button">Remove</button>
  `

  const removeButton = miniCardElement.querySelector(".mini-remove-btn")
  removeButton?.addEventListener("click", () => {
    removeMovieIdFromStorage(storageKey, movie.imdbID)
    renderLikedAndFavoriteSections()

    if (storageKey === MOVIE_LIKES_STORAGE_KEY) {
      showMsg(`Removed from liked: ${movie.Title}`)
    } else {
      showMsg(`Removed from favorite: ${movie.Title}`)
    }
  })

  return miniCardElement
}

async function fetchMoviesByIds(movieIds) {
  if (!movieIds.length) return []

  const movieRequests = movieIds.map((id) => fetch(`${MOVIE_API_URL}?apikey=${MOVIE_API_KEY}&i=${id}`).then((response) => response.json()))
  const movieResults = await Promise.all(movieRequests)
  return movieResults.filter((movie) => movie && movie.Response === "True")
}

function toggleEmptyState(listElement, emptyMessageElement, movieIds) {
  if (!listElement || !emptyMessageElement) return

  if (!movieIds.length) {
    listElement.innerHTML = ""
    emptyMessageElement.classList.remove("hidden")
  } else {
    emptyMessageElement.classList.add("hidden")
  }
}

async function renderSavedMovieGroup(storageKey, listElement, emptyMessageElement) {
  const savedMovieIds = getStoredMovieIds(storageKey)
  toggleEmptyState(listElement, emptyMessageElement, savedMovieIds)
  if (!savedMovieIds.length || !listElement) return

  listElement.innerHTML = ""
  try {
    const movies = await fetchMoviesByIds(savedMovieIds)
    if (!movies.length) {
      if (emptyMessageElement) {
        emptyMessageElement.innerText = "No movies found."
        emptyMessageElement.classList.remove("hidden")
      }
      return
    }

    if (emptyMessageElement) emptyMessageElement.classList.add("hidden")
    movies.forEach((movie) => {
      listElement.appendChild(createMiniMovieCard(movie, storageKey))
    })
  } catch {
    if (emptyMessageElement) {
      emptyMessageElement.innerText = "Could not load movies right now."
      emptyMessageElement.classList.remove("hidden")
    }
  }
}

function renderLikedAndFavoriteSections() {
  renderSavedMovieGroup(MOVIE_LIKES_STORAGE_KEY, likedMoviesListElement, likedMoviesEmptyElement)
  renderSavedMovieGroup(MOVIE_FAVORITES_STORAGE_KEY, favoriteMoviesListElement, favoriteMoviesEmptyElement)
}

loadList()
updateCount()
renderWatchlist()
renderLikedAndFavoriteSections()
console.log("Watchlist page ready!")
