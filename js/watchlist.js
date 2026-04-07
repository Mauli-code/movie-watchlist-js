// Watchlist page - shows movies user added to watchlist
const wlGrid = document.getElementById("wlGrid")
const wlEmpty = document.getElementById("wlEmptyState")  // using var here, not sure why it matters
const wlActions = document.getElementById("wlActions")
const wlCount = document.getElementById("wlCount")
const pickRandomBtn = document.getElementById("randomBtn")
const removeAllBtn = document.getElementById("clearAllBtn")

// display watchlist on page
function renderWatchlist() {
  console.log("Rendering watchlist with", watchlist.length, "movies")
  
  wlGrid.innerHTML = ""
  
  // if empty, show empty message
  if (watchlist.length === 0) {
    wlEmpty.classList.remove("hidden")
    wlActions.classList.add("hidden")
    return
  }

  // show the watchlist
  wlEmpty.classList.add("hidden")
  wlActions.classList.remove("hidden")
  wlCount.innerText = watchlist.length

  // using forEach - I learned it's better than for loop
  watchlist.forEach(function(movie) {
    const card = makeWatchlistCard(movie)
    wlGrid.appendChild(card)
  })
}

// create card for watchlist movie - this takes forever
function makeWatchlistCard(movie) {
  const card = document.createElement("div")
  const isInWl = isInList(movie.imdbID)
  card.className = `movie-card ${isInWl ? "saved" : ""}`
  card.dataset.id = movie.imdbID

  // poster or placeholder - not sure why this is so complicated
  var posterHTML = ""
  if (movie.Poster && movie.Poster !== "N/A") {
    posterHTML = `<img class="card-poster" src="${movie.Poster}" alt="${movie.Title}" loading="lazy">`
  } else {
    posterHTML = `<div class="card-poster" style="background: #334155; display: flex; align-items: center; justify-content: center;">No Poster</div>`
  }

  card.innerHTML = `
    <div class="card-poster-wrap">
      ${posterHTML}
      <button class="card-bookmark-btn" data-id="${movie.imdbID}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isInWl ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
    <div class="card-body">
      <div class="card-title">${escape(movie.Title)}</div>
      <div class="card-year">${movie.Year || "?"}</div>
      <div class="card-actions">
        <button class="btn-sm btn-card-save">${isInWl ? "✓ Saved" : "+ Watchlist"}</button>
      </div>
    </div>
  `

  // button listeners - this is messy but it works
  const removeBtn = card.querySelector(".btn-card-save")
  const bookmarkBtn = card.querySelector(".card-bookmark-btn")

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    removeFromWatchlist(movie, card)
  })

  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    removeFromWatchlist(movie, card)
  })

  return card
}

// remove movie from watchlist - or add it back
function removeFromWatchlist(movie, cardElement) {
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

  // update button - I'm not sure if this is the right way to do it
  if (cardElement) {
    const btn = cardElement.querySelector(".btn-card-save")
    if (btn) {
      btn.innerText = isInList(movie.imdbID) ? "✓ Saved" : "+ Watchlist"
    }
    const svg = cardElement.querySelector(".card-bookmark-btn svg")
    if (svg) {
      svg.setAttribute("fill", isInList(movie.imdbID) ? "currentColor" : "none")
    }
  }

  updateCount()
  renderWatchlist()
}

function clearWatchlist() {
  watchlist = []
  saveList()
  localStorage.removeItem(WATCHLIST_STORAGE_KEY)
  renderWatchlist()
  updateCount()
  showMsg("Watchlist cleared")
  console.log("Cleared watchlist")
}

function resetClearAllButton() {
  if (!removeAllBtn) return
  removeAllBtn.dataset.confirm = "no"
  removeAllBtn.innerText = "Clear All"
}

// random movie picker - kinda fun feature
pickRandomBtn?.addEventListener("click", () => {
  if (watchlist.length === 0) {
    console.log("Watchlist is empty!")
    showMsg("Watchlist is empty")
    return
  }

  // pick random number
  const randomIndex = Math.floor(Math.random() * watchlist.length)
  const randomMovie = watchlist[randomIndex]
  
  console.log("Random pick:", randomMovie.Title)
  showMsg(`Try: ${randomMovie.Title}`)
})

// clear everything from watchlist - be careful!
removeAllBtn?.addEventListener("click", () => {
  if (watchlist.length === 0) {
    showMsg("Watchlist is already empty")
    return
  }

  if (removeAllBtn.dataset.confirm !== "yes") {
    removeAllBtn.dataset.confirm = "yes"
    removeAllBtn.innerText = "Confirm Clear"
    showMsg("Click again to clear all")
    setTimeout(resetClearAllButton, 3000)
    return
  }

  if (removeAllBtn.dataset.confirm === "yes") {
    clearWatchlist()
    resetClearAllButton()
  }
})

// helper to show error - not sure why this is separate
function showErr(message) {
  let errorBox = document.getElementById("errorBox")
  if (!errorBox) {
    console.log("Error:", message)
    return
  }
  errorBox.classList.remove("hidden")
  errorBox.innerHTML = `<span>${message}</span>`
  setTimeout(() => {
    errorBox.classList.add("hidden")
  }, 3000)
}

// Ensure saved data is loaded before first render on this page.
loadList()
updateCount()
renderWatchlist()
console.log("Watchlist page ready!")
