# Movie App

A simple movie search and watchlist app.

## Features

- Search for movies
- Add to watchlist
- View details
- Dark mode

## How to run

Open index.html in browser or use a local server.
* Remove movies from watchlist
* View detailed movie information
* Sort movies by year (newest/oldest) or alphabetically
* Random movie picker from watchlist
* Persistent storage using localStorage

### Technical Features

* Debounced search input (480ms delay)
* Loading states and error handling
* Responsive design (mobile, tablet, desktop)
* Array Higher-Order Functions implementation:
  - `filter()` for removing movies from watchlist
  - `sort()` for sorting results
  - `map()` for rendering movie cards
  - `find()` for checking saved status
  - `some()` for watchlist validation

---

## Setup Instructions

### Prerequisites

* A modern web browser
* Internet connection for API calls
* Local server (recommended for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/movie-watchlist-js.git
   cd movie-watchlist-js
   ```

2. Start a local server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Or using Node.js
   npx http-server

   # Or using any other static file server
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8081/index.html
   ```

### API Key Setup

The application uses a free OMDb API key. If you want to use your own key:

1. Get an API key from [OMDb API](http://www.omdbapi.com/apikey.aspx)
2. Replace the `API_KEY` variable in `script.js`:
   ```javascript
   const API_KEY = "your_api_key_here";
   ```

---

## Project Structure

```
movie-watchlist-js/
├── index.html      # Home page (popular movies)
├── movies.html     # Search page
├── watchlist.html  # Watchlist page
├── coming.html     # Coming soon page
├── css/
│   ├── home.css    # Styles for home page
│   ├── movies.css  # Styles for movies page
│   ├── watchlist.css # Styles for watchlist page
│   └── coming.css  # Styles for coming page
├── js/
│   ├── common.js   # Shared functions (watchlist, theme)
│   ├── home.js     # Home page logic
│   ├── movies.js   # Movies search logic
│   ├── watchlist.js # Watchlist display logic
│   └── coming.js   # Coming page logic
└── README.md       # Project documentation
```

---

## How to Use

1. **Search Movies**: Type in the search box to find movies
2. **View Details**: Click "Details" on any movie card
3. **Add to Watchlist**: Click "Watchlist" button or bookmark icon
4. **Manage Watchlist**: Click "Watchlist" in the navigation
5. **Sort Results**: Use the dropdown to sort movies
6. **Random Pick**: In watchlist sidebar, click "Pick Random"

---

## Future Enhancements

* Filter movies by genre/year
* User authentication
* Share watchlists
* Movie recommendations
* Dark mode toggle
* Infinite scroll for search results

---

## Browser Support

* Chrome 70+
* Firefox 65+
* Safari 12+
* Edge 79+

---

## License

This project is for educational purposes.

---

## Author

Shrungar - Student Project

---

## Technologies Used

* HTML
* CSS
* JavaScript

---

## Project Structure

movie-watchlist
├── index.html
├── style.css
└── script.js

---

## Project Plan

* Week 1: Setup and planning
* Week 2: API integration and search
* Week 3: Watchlist functionality
* Week 4: UI improvements

---

## Feasibility

This project is simple and achievable within the given timeline. It supports search, filtering, and sorting, which are required for this assignment.

---

## Author

Shrungar Maske
