# Movie App

A lightweight movie browsing app built with HTML, CSS, and vanilla JavaScript. It lets users search movies, view details, save titles to a watchlist, and switch between light and dark themes.

## Features

- Search movies with OMDb API data
- Infinite scroll on the Movies page
- View movie details on cards
- Add and remove movies from the watchlist
- Like and favorite movies in the library
- Random movie picker
- Light and dark mode toggle
- Responsive layout for desktop and mobile

## Pages

- `index.html` - Home page with popular movies
- `movies.html` - Movie search page
- `watchlist.html` - Saved watchlist page
- `library.html` - Library page with liked and favorite movies
- `coming.html` - Coming soon page

## Project Structure

```text
movie-watchlist-js/
├── index.html
├── movies.html
├── watchlist.html
├── library.html
├── coming.html
├── css/
│   ├── home.css
│   ├── home-light.css
│   ├── home-dark.css
│   ├── movies.css
│   └── watchlist.css
└── js/
    ├── common.js
    ├── home.js
    ├── movie-card.js
    ├── movies.js
    └── watchlist.js
```

## Setup

### Prerequisites

- A modern web browser
- Internet connection for OMDb API requests

### Run Locally

1. Open the project folder in VS Code or your file explorer.
2. Start a local server. For example:

```bash
python3 -m http.server 8000
```

3. Open the site in your browser:

```text
http://localhost:8000/index.html
```

## API

The app uses the OMDb API. The API key is currently defined in the JavaScript files used by the app.

If you want to change it, update the API key constant in the relevant JS file.

## Notes

- The project uses shared styling for the movie pages.
- The design uses a soft light theme with a dark mode option.
- Movie data is stored in `localStorage` for watchlist, likes, and favorites.

## Author

Shrungar Maske