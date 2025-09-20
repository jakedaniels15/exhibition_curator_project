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
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search artworks by title, artist, or keyword..."
            className="search-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || !searchTerm.trim()}
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

      <div className="search-presets">
        <span className="presets-label">Quick search:</span>
        <button
          onClick={() => onSearch("Van Gogh")}
          className="preset-button"
          disabled={isLoading}
        >
          Van Gogh
        </button>
        <button
          onClick={() => onSearch("Monet")}
          className="preset-button"
          disabled={isLoading}
        >
          Monet
        </button>
        <button
          onClick={() => onSearch("Picasso")}
          className="preset-button"
          disabled={isLoading}
        >
          Picasso
        </button>
        <button
          onClick={() => onSearch("Renaissance")}
          className="preset-button"
          disabled={isLoading}
        >
          Renaissance
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
