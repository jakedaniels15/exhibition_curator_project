import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { searchAllMuseums } from "../services/museumApi";
import { collectionService } from "../services/collectionService";
import "./Search.css";

function Search() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [collectionItems, setCollectionItems] = useState(new Set());
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  // Load collection on mount
  useEffect(() => {
    const loadCollection = () => {
      const collection = collectionService.getCollection();
      const collectionIds = new Set(collection.map(item => item.id));
      setCollectionItems(collectionIds);
    };

    loadCollection();
    
    // Listen for storage changes (if collection changes in another tab)
    const handleStorageChange = () => {
      loadCollection();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for auto search parameter (when returning from artwork detail)
  useEffect(() => {
    const autoSearchTerm = searchParams.get('auto');
    if (autoSearchTerm) {
      handleSearch(autoSearchTerm);
    }
  }, [searchParams]);

  const handleSearch = async (searchTerm) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setCurrentSearchTerm(searchTerm);

    try {
      console.log("Searching for:", searchTerm);

      // Use real museum APIs
      const results = await searchAllMuseums(searchTerm, 10);
      setSearchResults(results);

      if (results.length === 0) {
        setError("No artworks found. Try a different search term.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError("Search failed. Please try again later.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = (e, artwork) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isInCollection = collectionItems.has(artwork.id);
    
    if (isInCollection) {
      // Remove from collection
      const result = collectionService.removeFromCollection(artwork.id);
      if (result.success) {
        setCollectionItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(artwork.id);
          return newSet;
        });
      }
    } else {
      // Add to collection
      const result = collectionService.addToCollection(artwork);
      if (result.success) {
        setCollectionItems(prev => new Set(prev).add(artwork.id));
      }
    }
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>Browse Artworks</h1>
        <p>Discover masterpieces from world-renowned museums</p>
      </header>

      <SearchBar 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        initialValue={currentSearchTerm}
      />

      <div className="search-results">
        {isLoading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Searching artworks from museums around the world...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="retry-button">
              Try Another Search
            </button>
          </div>
        )}

        {!isLoading && !error && hasSearched && searchResults.length === 0 && (
          <div className="no-results">
            <p>No artworks found. Try a different search term.</p>
          </div>
        )}

        {!isLoading && !error && searchResults.length > 0 && (
          <div className="results-grid">
            <h2>Search Results ({searchResults.length})</h2>
            <div className="artwork-grid">
              {searchResults.map((artwork) => (
                <div key={artwork.id} className="artwork-card">
                  <div className="artwork-image">
                    {artwork.thumbnailUrl ? (
                      <img
                        src={artwork.thumbnailUrl}
                        alt={artwork.title}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="artwork-placeholder"
                      style={{
                        display: artwork.thumbnailUrl ? "none" : "flex",
                      }}
                    >
                      <span>No Image</span>
                    </div>
                  </div>

                  <div className="artwork-info">
                    <h3>{artwork.title}</h3>
                    <p className="artist">{artwork.artist}</p>
                    <p className="date">{artwork.date}</p>
                    <p className="museum">{artwork.museum}</p>

                    <div className="artwork-actions">
                      <Link
                        to={`/artwork/${artwork.id}?from=search&q=${encodeURIComponent(currentSearchTerm)}`}
                        className="view-details-btn"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={(e) => handleAddToCollection(e, artwork)}
                        className={`add-to-collection-btn ${collectionItems.has(artwork.id) ? 'in-collection' : ''}`}
                      >
                        {collectionItems.has(artwork.id) ? '✓ In Collection' : 'Add to Collection'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasSearched && (
          <div className="search-prompt">
            <h2>Start your art discovery</h2>
            <p>
              Use the search bar above to find artworks by title, artist, or
              keyword
            </p>
            <p>Or try one of the quick search options to get started</p>
            <div className="museum-info">
              <p>🎨 Searching across:</p>
              <ul>
                <li>Art Institute of Chicago</li>
                <li>Metropolitan Museum of Art</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
