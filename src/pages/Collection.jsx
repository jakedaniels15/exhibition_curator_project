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
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>My Collection</h1>
        </div>
        <div className="loading-message">Loading your collection...</div>
      </div>
    );
  }

  return (
    <div className="collection-page">
      <div className="collection-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>My Collection</h1>
        {collection.length > 0 && (
          <div className="collection-actions">
            <span className="collection-count">
              {filteredCollection.length} of {collection.length} artwork{collection.length !== 1 ? 's' : ''}
            </span>
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
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default Collection;
