import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { searchAllMuseums } from "../services/museumApi";
import { collectionService } from "../services/collectionService";
import "./Search.css";

function Search() {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const [collectionItems, setCollectionItems] = useState(new Set());
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  
  // Filter and sort states
  const [sortBy, setSortBy] = useState('relevance');
  const [filterMuseum, setFilterMuseum] = useState('all');
  const [filterHasImage, setFilterHasImage] = useState('all');

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

  // Check for auto search parameter (when returning from artwork detail) or museum parameter (from home page)
  useEffect(() => {
    const autoSearchTerm = searchParams.get('auto');
    const museumParam = searchParams.get('museum');
    
    console.log('Search params:', { autoSearchTerm, museumParam });
    
    if (autoSearchTerm) {
      handleSearch(autoSearchTerm);
    } else if (museumParam) {
      console.log('Museum parameter detected:', museumParam);
      // Search for broad terms to get museum collections
      handleSearch('art');
      // Set the museum filter to the specified museum
      setTimeout(() => {
        console.log('Setting museum filter to:', museumParam);
        setFilterMuseum(museumParam);
      }, 100);
    }
  }, [searchParams]);

  // Apply filters and sorting whenever results or filter options change
  useEffect(() => {
    let filtered = [...searchResults];

    // Apply museum filter
    if (filterMuseum !== 'all') {
      filtered = filtered.filter(artwork => artwork.museum === filterMuseum);
    }

    // Apply image filter
    if (filterHasImage === 'with-image') {
      filtered = filtered.filter(artwork => artwork.thumbnailUrl || artwork.imageUrl);
    } else if (filterHasImage === 'without-image') {
      filtered = filtered.filter(artwork => !artwork.thumbnailUrl && !artwork.imageUrl);
    }

    // Apply sorting
    switch (sortBy) {
      case 'title-asc':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title-desc':
        filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'artist-asc':
        filtered.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
        break;
      case 'artist-desc':
        filtered.sort((a, b) => (b.artist || '').localeCompare(a.artist || ''));
        break;
      case 'date-newest':
        filtered.sort((a, b) => {
          const yearA = parseInt((a.date || '').match(/\d{4}/)?.[0] || '0');
          const yearB = parseInt((b.date || '').match(/\d{4}/)?.[0] || '0');
          return yearB - yearA;
        });
        break;
      case 'date-oldest':
        filtered.sort((a, b) => {
          const yearA = parseInt((a.date || '').match(/\d{4}/)?.[0] || '0');
          const yearB = parseInt((b.date || '').match(/\d{4}/)?.[0] || '0');
          return yearA - yearB;
        });
        break;
      case 'museum':
        filtered.sort((a, b) => (a.museum || '').localeCompare(b.museum || ''));
        break;
      default: // 'relevance'
        // Keep original order (relevance from API)
        break;
    }

    setFilteredResults(filtered);
  }, [searchResults, sortBy, filterMuseum, filterHasImage]);

  // Get unique museums from current results for filter dropdown
  const availableMuseums = [...new Set(searchResults.map(artwork => artwork.museum).filter(Boolean))];

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
        <div className="header-content">
          <h1>Browse Artworks</h1>
          {searchParams.get('museum') ? (
            <p className="museum-subtitle">Exploring {searchParams.get('museum')}</p>
          ) : (
            <p>Discover masterpieces from world-renowned museums</p>
          )}
        </div>
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
            <div className="results-header">
              <h2>Search Results ({filteredResults.length} of {searchResults.length})</h2>
              
              <div className="filters-container">
                <div className="filter-group">
                  <label htmlFor="sort-select">Sort by:</label>
                  <select 
                    id="sort-select"
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                    <option value="artist-asc">Artist (A-Z)</option>
                    <option value="artist-desc">Artist (Z-A)</option>
                    <option value="date-newest">Date (Newest)</option>
                    <option value="date-oldest">Date (Oldest)</option>
                    <option value="museum">Museum</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="museum-filter">Museum:</label>
                  <select 
                    id="museum-filter"
                    value={filterMuseum} 
                    onChange={(e) => setFilterMuseum(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Museums</option>
                    {availableMuseums.map(museum => (
                      <option key={museum} value={museum}>{museum}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="image-filter">Images:</label>
                  <select 
                    id="image-filter"
                    value={filterHasImage} 
                    onChange={(e) => setFilterHasImage(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Artworks</option>
                    <option value="with-image">With Images</option>
                    <option value="without-image">Without Images</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="artwork-grid">
              {filteredResults.map((artwork) => (
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
