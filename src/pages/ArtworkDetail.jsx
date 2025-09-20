import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import ImageMagnifier from "../components/ImageMagnifier";
import { getArtworkDetails } from "../services/museumApi";
import { collectionService } from "../services/collectionService";
import "./ArtworkDetail.css";

function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [artwork, setArtwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInCollection, setIsInCollection] = useState(false);

  useEffect(() => {
    const fetchArtworkDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const artworkData = await getArtworkDetails(id);
        setArtwork(artworkData);
        // Check if this artwork is already in collection
        setIsInCollection(collectionService.isInCollection(id));
      } catch (error) {
        console.error("Error fetching artwork details:", error);
        setError("Failed to load artwork details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArtworkDetails();
    }
  }, [id]);

  const handleAddToCollection = () => {
    if (!artwork) return;
    
    if (isInCollection) {
      // Remove from collection
      const result = collectionService.removeFromCollection(artwork.id);
      if (result.success) {
        setIsInCollection(false);
      }
    } else {
      // Add to collection
      const result = collectionService.addToCollection(artwork);
      if (result.success) {
        setIsInCollection(true);
      }
    }
  };

  const handleBackClick = () => {
    // Check if we came from search with a search term
    const fromSearch = searchParams.get('from') === 'search';
    const searchTerm = searchParams.get('q');
    
    if (fromSearch && searchTerm) {
      // Navigate back to search with the search term preserved
      navigate(`/search?auto=${encodeURIComponent(searchTerm)}`);
    } else {
      // Default back behavior
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="artwork-detail-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading artwork details...</p>
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="artwork-detail-page">
        <div className="error-container">
          <h2>Artwork Not Found</h2>
          <p>{error || "This artwork could not be found."}</p>
          <button onClick={handleBackClick} className="back-button">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = artwork.imageUrl || artwork.thumbnailUrl;

  return (
    <div className="artwork-detail-page">
      <header className="detail-header">
        <button onClick={handleBackClick} className="back-button">
          ← Back
        </button>
        <div className="header-actions">
          <button
            onClick={handleAddToCollection}
            className={`add-to-collection-btn ${isInCollection ? 'in-collection' : ''}`}
          >
            {isInCollection ? '✓ In Collection' : 'Add to Collection'}
          </button>
        </div>
      </header>

      <div className="artwork-detail-content">
        <div className="artwork-image-section">
          {imageUrl ? (
            <ImageMagnifier
              src={imageUrl}
              alt={artwork.title}
              magnifierSize={200}
              zoomLevel={3}
            />
          ) : (
            <div className="no-image-placeholder">
              <span>No image available</span>
            </div>
          )}
        </div>

        <div className="artwork-info-section">
          <div className="artwork-header">
            <h1 className="artwork-title">{artwork.title}</h1>
            <p className="artwork-artist">{artwork.artist}</p>
            <p className="artwork-date">{artwork.date}</p>
          </div>

          <div className="artwork-details">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Museum</label>
                <span>{artwork.museum}</span>
              </div>

              {artwork.medium && (
                <div className="detail-item">
                  <label>Medium</label>
                  <span>{artwork.medium}</span>
                </div>
              )}

              {artwork.dimensions && (
                <div className="detail-item">
                  <label>Dimensions</label>
                  <span>{artwork.dimensions}</span>
                </div>
              )}

              {artwork.department && (
                <div className="detail-item">
                  <label>Department</label>
                  <span>{artwork.department}</span>
                </div>
              )}

              {artwork.placeOfOrigin && (
                <div className="detail-item">
                  <label>Place of Origin</label>
                  <span>{artwork.placeOfOrigin}</span>
                </div>
              )}

              {artwork.classification && (
                <div className="detail-item">
                  <label>Classification</label>
                  <span>{artwork.classification}</span>
                </div>
              )}

              {artwork.creditLine && (
                <div className="detail-item">
                  <label>Credit Line</label>
                  <span>{artwork.creditLine}</span>
                </div>
              )}
            </div>

            {artwork.description && (
              <div className="artwork-description">
                <h3>Description</h3>
                <p dangerouslySetInnerHTML={{ __html: artwork.description }} />
              </div>
            )}

            {artwork.subjects && artwork.subjects.length > 0 && (
              <div className="artwork-subjects">
                <h3>Subjects</h3>
                <div className="subject-tags">
                  {artwork.subjects.slice(0, 8).map((subject, index) => (
                    <span key={index} className="subject-tag">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {artwork.materials && artwork.materials.length > 0 && (
              <div className="artwork-materials">
                <h3>Materials</h3>
                <div className="material-tags">
                  {artwork.materials.slice(0, 6).map((material, index) => (
                    <span key={index} className="material-tag">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="external-links">
            {artwork.museumUrl && (
              <a
                href={artwork.museumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="museum-link"
              >
                View at {artwork.museum} →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtworkDetail;
