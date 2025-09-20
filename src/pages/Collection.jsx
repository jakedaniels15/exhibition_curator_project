import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collectionService } from "../services/collectionService";
import "./Collection.css";

function Collection() {
  const [collection, setCollection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCollection = () => {
      setIsLoading(true);
      const userCollection = collectionService.getCollection();
      setCollection(userCollection);
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
              {collection.length} artwork{collection.length !== 1 ? 's' : ''}
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
        <div className="collection-content">
          <div className="artworks-grid">
            {collection.map((artwork) => (
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
                  <h3 className="artwork-title">{artwork.title}</h3>
                  {artwork.artist && (
                    <p className="artwork-artist">{artwork.artist}</p>
                  )}
                  {artwork.date && (
                    <p className="artwork-date">{artwork.date}</p>
                  )}
                  {artwork.museum && (
                    <p className="artwork-museum">{artwork.museum}</p>
                  )}
                  <p className="added-date">
                    Added {new Date(artwork.addedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="card-actions">
                  <Link 
                    to={`/artwork/${artwork.id}`} 
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
      )}
    </div>
  );
}

export default Collection;
