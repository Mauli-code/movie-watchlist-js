// Basic API settings
const API_KEY = "fb6234a5";
const BASE_URL = "https://www.omdbapi.com/";

// Get HTML elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('movieResultsContainer');
const watchlistDiv = document.getElementById('watchlistContainer');
const watchlistCountSpan = document.getElementById('watchlistCount');

// My watchlist array
let myWatchlist = [];

// Load watchlist when page opens
function loadWatchlist() {
    let saved = localStorage.getItem('myMovies');
    if (saved) {
        myWatchlist = JSON.parse(saved);
    }
    showWatchlist();
}

// Save watchlist
function saveWatchlist() {
    localStorage.setItem('myMovies', JSON.stringify(myWatchlist));
    showWatchlist();
}

// Check if movie already in watchlist
function alreadyInList(movieId) {
    for (let i = 0; i < myWatchlist.length; i++) {
        if (myWatchlist[i].id === movieId) {
            return true;
        }
    }
    return false;
}

// Add movie to watchlist
function addMovie(id, title, year, poster) {
    // Check if already added
    if (alreadyInList(id)) {
        alert('Movie already in your watchlist!');
        return;
    }
    
    // Add to array
    myWatchlist.push({
        id: id,
        title: title,
        year: year,
        poster: poster
    });
    
    // Save and update display
    saveWatchlist();
    alert('Added to watchlist!');
}

// Remove movie from watchlist
function removeMovie(movieId) {
    let newList = [];
    for (let i = 0; i < myWatchlist.length; i++) {
        if (myWatchlist[i].id !== movieId) {
            newList.push(myWatchlist[i]);
        }
    }
    myWatchlist = newList;
    saveWatchlist();
    alert('Removed from watchlist!');
}

// Show watchlist on page
function showWatchlist() {
    // Clear the div
    watchlistDiv.innerHTML = '';
    
    // Show count
    watchlistCountSpan.innerHTML = '(' + myWatchlist.length + ')';
    
    // If no movies
    if (myWatchlist.length === 0) {
        watchlistDiv.innerHTML = '<p>No movies yet</p>';
        return;
    }
    
    // Show each movie
    for (let i = 0; i < myWatchlist.length; i++) {
        let movie = myWatchlist[i];
        
        // Create elements
        let movieDiv = document.createElement('div');
        movieDiv.className = 'movie-card';
        
        let img = document.createElement('img');
        if (movie.poster && movie.poster !== 'N/A') {
            img.src = movie.poster;
        } else {
            img.src = 'https://via.placeholder.com/300x450?text=No+Poster';
        }
        
        let title = document.createElement('h3');
        title.innerHTML = movie.title;
        
        let year = document.createElement('p');
        year.innerHTML = movie.year;
        
        let removeBtn = document.createElement('button');
        removeBtn.innerHTML = 'Remove';
        removeBtn.onclick = function() {
            removeMovie(movie.id);
        };
        
        // Add to page
        movieDiv.appendChild(img);
        movieDiv.appendChild(title);
        movieDiv.appendChild(year);
        movieDiv.appendChild(removeBtn);
        watchlistDiv.appendChild(movieDiv);
    }
}

// Show search results
function showResults(movies) {
    // Clear previous results
    resultsDiv.innerHTML = '';
    
    // If no movies found
    if (movies.length === 0) {
        resultsDiv.innerHTML = '<p>No movies found</p>';
        return;
    }
    
    // Show each movie
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i];
        
        // Create card
        let movieDiv = document.createElement('div');
        movieDiv.className = 'movie-card';
        
        // Poster image
        let img = document.createElement('img');
        if (movie.Poster && movie.Poster !== 'N/A') {
            img.src = movie.Poster;
        } else {
            img.src = 'https://via.placeholder.com/300x450?text=No+Poster';
        }
        
        // Title
        let title = document.createElement('h3');
        title.innerHTML = movie.Title;
        
        // Year
        let year = document.createElement('p');
        year.innerHTML = movie.Year;
        
        // Add button
        let addBtn = document.createElement('button');
        
        // Check if already in watchlist
        if (alreadyInList(movie.imdbID)) {
            addBtn.innerHTML = 'In Watchlist';
            addBtn.disabled = true;
        } else {
            addBtn.innerHTML = 'Add to Watchlist';
            addBtn.onclick = function() {
                addMovie(movie.imdbID, movie.Title, movie.Year, movie.Poster);
                // Update button after adding
                addBtn.innerHTML = 'In Watchlist';
                addBtn.disabled = true;
            };
        }
        
        // Add to page
        movieDiv.appendChild(img);
        movieDiv.appendChild(title);
        movieDiv.appendChild(year);
        movieDiv.appendChild(addBtn);
        resultsDiv.appendChild(movieDiv);
    }
}

// Search movies from API
function searchMovies() {
    // Get search text
    let searchText = searchInput.value;
    
    // Check if empty
    if (searchText === '') {
        alert('Please type a movie name');
        return;
    }
    
    // Show loading
    resultsDiv.innerHTML = '<p>Loading...</p>';
    
    // Call API
    let url = BASE_URL + '?s=' + searchText + '&apikey=' + API_KEY;
    
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.Response === 'True') {
                showResults(data.Search);
            } else {
                resultsDiv.innerHTML = '<p>No movies found</p>';
            }
        })
        .catch(function(error) {
            resultsDiv.innerHTML = '<p>Error loading movies</p>';
        });
}

// Search when button clicked
searchBtn.onclick = function() {
    searchMovies();
};

// Search when Enter key pressed
searchInput.onkeypress = function(event) {
    if (event.key === 'Enter') {
        searchMovies();
    }
};

// Load watchlist when page loads
loadWatchlist();
