import { useState, useEffect } from "react";
import "./SearchBar.css";

function SearchBar({ onSearch, isLoading, initialValue = "" }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Update search term when initialValue changes
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <div className="search-input-container">
          <label htmlFor="artwork-search" className="sr-only">
            Search artworks by title, artist, or keyword
          </label>
          <input
            id="artwork-search"
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search artworks by title, artist, or keyword..."
            className="search-input"
            disabled={isLoading}
            aria-label="Search artworks by title, artist, or keyword"
            aria-describedby="search-help"
            autoComplete="off"
          />
          <div id="search-help" className="sr-only">
            Enter keywords to search through museum artwork collections
          </div>
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || !searchTerm.trim()}
            aria-label={isLoading ? "Searching..." : "Search artworks"}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            )}
          </button>
        </div>
      </form>

            <div className="preset-searches">
        <span className="presets-label" id="presets-label">Quick search:</span>
        <div role="group" aria-labelledby="presets-label">
          <button
            onClick={() => onSearch("Van Gogh")}
            className="preset-button"
            disabled={isLoading}
            aria-label="Search for Van Gogh artworks"
          >
            Van Gogh
          </button>
          <button
            onClick={() => onSearch("Monet")}
            className="preset-button"
            disabled={isLoading}
            aria-label="Search for Monet artworks"
          >
            Monet
          </button>
          <button
            onClick={() => onSearch("Picasso")}
            className="preset-button"
            disabled={isLoading}
            aria-label="Search for Picasso artworks"
          >
            Picasso
          </button>
          <button
            onClick={() => onSearch("Renaissance")}
            className="preset-button"
            disabled={isLoading}
            aria-label="Search for Renaissance artworks"
          >
            Renaissance
          </button>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="search-status">
        {isLoading && "Searching for artworks..."}
      </div>
    </div>
  );
}

export default SearchBar;
