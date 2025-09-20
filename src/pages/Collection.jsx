import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collectionService } from "../services/collectionService";
import "./Collection.css";

function Collection() {
  const [collection, setCollection] = useState([]);
  const [filteredCollection, setFilteredCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    artist: '',
    dateRange: ''
  });

  // Keyboard navigation states
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

  useEffect(() => {
    const loadCollection = () => {
      setIsLoading(true);
      const userCollection = collectionService.getCollection();
      setCollection(userCollection);
      setFilteredCollection(userCollection);
      setIsLoading(false);
    };

    loadCollection();
    
    // Listen for storage changes (if user adds/removes items in another tab)
    const handleStorageChange = () => {
      loadCollection();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter collection whenever filters or collection changes
  useEffect(() => {
    let filtered = [...collection];

    // Filter by type (based on classification or medium)
    if (filters.type) {
      filtered = filtered.filter(artwork => 
        artwork.classification?.toLowerCase().includes(filters.type.toLowerCase()) ||
        artwork.medium?.toLowerCase().includes(filters.type.toLowerCase()) ||
        artwork.objectType?.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    // Filter by artist
    if (filters.artist) {
      filtered = filtered.filter(artwork => 
        artwork.artist?.toLowerCase().includes(filters.artist.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      const currentYear = new Date().getFullYear();
      switch (filters.dateRange) {
        case 'ancient':
          filtered = filtered.filter(artwork => {
            const year = extractYear(artwork.date);
            return year && year < 500;
          });
          break;
        case 'medieval':
          filtered = filtered.filter(artwork => {
            const year = extractYear(artwork.date);
            return year && year >= 500 && year < 1500;
          });
          break;
        case 'renaissance':
          filtered = filtered.filter(artwork => {
            const year = extractYear(artwork.date);
            return year && year >= 1400 && year < 1600;
          });
          break;
        case 'modern':
          filtered = filtered.filter(artwork => {
            const year = extractYear(artwork.date);
            return year && year >= 1800 && year < 1945;
          });
          break;
        case 'contemporary':
          filtered = filtered.filter(artwork => {
            const year = extractYear(artwork.date);
            return year && year >= 1945;
          });
          break;
        default:
          break;
      }
    }

    setFilteredCollection(filtered);
  }, [collection, filters]);

  // Helper function to extract year from date string
  const extractYear = (dateString) => {
    if (!dateString) return null;
    const match = dateString.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
  };

  // Get unique values for filter options
  const getUniqueArtists = () => {
    const artists = collection.map(artwork => artwork.artist).filter(Boolean);
    return [...new Set(artists)].sort();
  };

  const getUniqueTypes = () => {
    const types = new Set();
    collection.forEach(artwork => {
      if (artwork.classification) types.add(artwork.classification);
      if (artwork.medium) types.add(artwork.medium);
      if (artwork.objectType) types.add(artwork.objectType);
    });
    return [...types].filter(Boolean).sort();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      artist: '',
      dateRange: ''
    });
  };

  // Keyboard navigation for collection cards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isKeyboardNavigation || filteredCollection.length === 0) return;

      const gridColumns = 5; // Collection uses 5 columns
      const totalCards = filteredCollection.length;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedCardIndex(prev => {
            const next = prev + 1;
            return next < totalCards ? next : prev;
          });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedCardIndex(prev => {
            const next = prev - 1;
            return next >= 0 ? next : prev;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedCardIndex(prev => {
            const next = prev + gridColumns;
            return next < totalCards ? next : prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedCardIndex(prev => {
            const next = prev - gridColumns;
            return next >= 0 ? next : prev;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedCardIndex >= 0 && focusedCardIndex < totalCards) {
            const card = filteredCollection[focusedCardIndex];
            window.location.href = `/artwork/${card.id}?from=collection`;
          }
          break;
        case 'Escape':
          setIsKeyboardNavigation(false);
          setFocusedCardIndex(-1);
          break;
      }
    };

    if (isKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isKeyboardNavigation, focusedCardIndex, filteredCollection]);

  // Reset focus when collection changes
  useEffect(() => {
    setFocusedCardIndex(-1);
    setIsKeyboardNavigation(false);
  }, [filteredCollection]);

  const handleRemoveFromCollection = (artworkId) => {
    const result = collectionService.removeFromCollection(artworkId);
    if (result.success) {
      setCollection(prev => prev.filter(item => item.id !== artworkId));
    }
  };

  const handleClearCollection = () => {
    if (window.confirm('Are you sure you want to clear your entire collection?')) {
      const result = collectionService.clearCollection();
      if (result.success) {
        setCollection([]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="collection-page">
        <div className="collection-header">
          <div className="navigation-links">
            <Link to="/" className="back-link">← Back to Home</Link>
            <Link to="/search" className="search-link">🔍 Search</Link>
          </div>
          <h1>My Collection</h1>
        </div>
        <div className="loading-message">Loading your collection...</div>
      </div>
    );
  }

  return (
    <div className="collection-page">
      <div className="collection-header">
        <div className="navigation-links">
          <Link to="/" className="back-link">← Back to Home</Link>
          <Link to="/search" className="search-link">🔍 Search</Link>
        </div>
        <h1>My Collection</h1>
        {collection.length > 0 && (
          <div className="collection-actions">
            <div className="collection-info">
              <span className="collection-count">
                {filteredCollection.length} of {collection.length} artwork{collection.length !== 1 ? 's' : ''}
              </span>
              <div className="social-share-icons">
                <button 
                  className="social-icon instagram-icon"
                  aria-label="Share collection on Instagram"
                  title="Share on Instagram (coming soon)"
                  disabled
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                <button 
                  className="social-icon twitter-icon"
                  aria-label="Share collection on X (Twitter)"
                  title="Share on X (coming soon)"
                  disabled
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                <button 
                  className="social-icon facebook-icon"
                  aria-label="Share collection on Facebook"
                  title="Share on Facebook (coming soon)"
                  disabled
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>
            </div>
            <button onClick={handleClearCollection} className="clear-collection-btn">
              Clear All
            </button>
          </div>
        )}
      </div>

      {collection.length === 0 ? (
        <div className="empty-collection">
          <h2>Your collection is empty</h2>
          <p>Browse artworks and click "Add to Collection" to start building your personal museum!</p>
          <Link to="/search" className="browse-link">
            Start Browsing →
          </Link>
        </div>
      ) : (
        <>
          {/* Filter Controls */}
          <div className="filter-section">
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="type-filter">Type:</label>
                <select 
                  id="type-filter"
                  value={filters.type} 
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  {getUniqueTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="artist-filter">Artist:</label>
                <select 
                  id="artist-filter"
                  value={filters.artist} 
                  onChange={(e) => handleFilterChange('artist', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Artists</option>
                  {getUniqueArtists().map(artist => (
                    <option key={artist} value={artist}>{artist}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="date-filter">Period:</label>
                <select 
                  id="date-filter"
                  value={filters.dateRange} 
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Periods</option>
                  <option value="ancient">Ancient (Before 500)</option>
                  <option value="medieval">Medieval (500-1500)</option>
                  <option value="renaissance">Renaissance (1400-1600)</option>
                  <option value="modern">Modern (1800-1945)</option>
                  <option value="contemporary">Contemporary (1945+)</option>
                </select>
              </div>

              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          </div>

          <div className="collection-content">
            <div className="artworks-grid">
              {filteredCollection.map((artwork) => (
              <div key={artwork.id} className="collection-artwork-card">
                <div className="artwork-image-container">
                  {artwork.imageUrl || artwork.thumbnailUrl ? (
                    <img
                      src={artwork.imageUrl || artwork.thumbnailUrl}
                      alt={artwork.title}
                      className="artwork-image"
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      No Image Available
                    </div>
                  )}
                </div>
                
                <div className="artwork-info">
                  <div className="artwork-details">
                    <h3 className="artwork-title">{artwork.title}</h3>
                    {artwork.artist && (
                      <p className="artwork-artist">{artwork.artist}</p>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <Link 
                    to={`/artwork/${artwork.id}?from=collection&collectionIndex=${filteredCollection.findIndex(item => item.id === artwork.id)}`} 
                    className="view-details-btn"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRemoveFromCollection(artwork.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            {/* Spacer for gap */}
            <div className="card-spacer"></div>
            
            {/* Add to Collection Card */}
            <div className="add-card-wrapper">
              <Link to="/search" className="add-to-collection-card">
                <div className="add-icon-container">
                  <div className="plus-icon">+</div>
                </div>
                <div className="add-card-content">
                  <h3 className="add-card-title">Add to Collection</h3>
                  <p className="add-card-subtitle">Discover new artworks</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default Collection;
