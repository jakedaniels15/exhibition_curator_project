import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { searchAllMuseums, searchInfiniteMuseumCollection } from "../services/museumApi";
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
  const [filterArtType, setFilterArtType] = useState('all');

  // Infinite scroll states
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [searchTermIndex, setSearchTermIndex] = useState(0);
  const [isMuseumMode, setIsMuseumMode] = useState(false);

  // Keyboard navigation states
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

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
      // Use broader search to get comprehensive museum collections
      handleMuseumSearch(museumParam);
    }
  }, [searchParams]);

  // Apply filters and sorting whenever results or filter options change
  useEffect(() => {
    let filtered = [...searchResults];

    // Apply museum filter
    if (filterMuseum !== 'all') {
      filtered = filtered.filter(artwork => artwork.museum === filterMuseum);
    }

    // Apply art type filter
    if (filterArtType !== 'all') {
      filtered = filtered.filter(artwork => {
        const artType = artwork.artworkType || artwork.medium || '';
        const department = artwork.department || '';
        const combinedText = `${artType} ${department}`.toLowerCase();
        
        // Check if the selected filter matches the artwork
        switch (filterArtType) {
          case 'Painting':
            return combinedText.includes('painting') || combinedText.includes('oil') || 
                   combinedText.includes('acrylic') || combinedText.includes('watercolor') || 
                   combinedText.includes('tempera');
          case 'Sculpture':
            return combinedText.includes('sculpture') || combinedText.includes('bronze') || 
                   combinedText.includes('marble') || combinedText.includes('stone') || 
                   combinedText.includes('carving');
          case 'Drawing':
            return combinedText.includes('drawing') || combinedText.includes('sketch') || 
                   combinedText.includes('charcoal') || combinedText.includes('pastel') || 
                   combinedText.includes('graphite');
          case 'Print':
            return combinedText.includes('print') || combinedText.includes('etching') || 
                   combinedText.includes('lithograph') || combinedText.includes('engraving') || 
                   combinedText.includes('woodcut');
          case 'Photography':
            return combinedText.includes('photograph') || combinedText.includes('daguerreotype') || 
                   combinedText.includes('gelatin silver');
          case 'Ceramics':
            return combinedText.includes('ceramic') || combinedText.includes('pottery') || 
                   combinedText.includes('porcelain') || combinedText.includes('earthenware');
          case 'Textiles':
            return combinedText.includes('textile') || combinedText.includes('fabric') || 
                   combinedText.includes('tapestry') || combinedText.includes('embroidery');
          case 'Glass':
            return combinedText.includes('glass') || combinedText.includes('crystal');
          case 'Furniture':
            return combinedText.includes('furniture') || combinedText.includes('chair') || 
                   combinedText.includes('table') || combinedText.includes('cabinet');
          case 'Jewelry':
            return combinedText.includes('jewelry') || combinedText.includes('ring') || 
                   combinedText.includes('necklace') || combinedText.includes('bracelet');
          case 'Metalwork':
            return combinedText.includes('metal') && !combinedText.includes('bronze');
          case 'Manuscript':
            return combinedText.includes('manuscript') || combinedText.includes('illuminated') || 
                   combinedText.includes('book') || combinedText.includes('folio');
          case 'Ancient Art':
            return combinedText.includes('vessel') || combinedText.includes('amphora') || 
                   combinedText.includes('vase') || combinedText.includes('ancient');
          case 'Contemporary Art':
            return combinedText.includes('installation') || combinedText.includes('conceptual') || 
                   combinedText.includes('performance');
          case 'Mixed Media':
            return combinedText.includes('collage') || combinedText.includes('assemblage') || 
                   combinedText.includes('mixed media');
          case 'Design':
            return combinedText.includes('architectural') || combinedText.includes('design');
          default:
            // For other types, check if the filter matches the original art type
            return artType.toLowerCase().includes(filterArtType.toLowerCase()) ||
                   filterArtType.toLowerCase().includes(artType.toLowerCase());
        }
      });
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

    console.log('Filtered results:', filtered.length, 'out of', searchResults.length);
    console.log('Filter settings:', { filterMuseum, filterHasImage, filterArtType });

    setFilteredResults(filtered);
  }, [searchResults, sortBy, filterMuseum, filterHasImage, filterArtType]);

  // Keyboard navigation for artwork cards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isKeyboardNavigation || filteredResults.length === 0) return;

      const gridColumns = 4;
      const totalCards = filteredResults.length;

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
            const card = filteredResults[focusedCardIndex];
            window.location.href = `/artwork/${card.id}?from=search&q=${encodeURIComponent(currentSearchTerm)}`;
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
  }, [isKeyboardNavigation, focusedCardIndex, filteredResults, currentSearchTerm]);

  // Reset focus when search results change
  useEffect(() => {
    setFocusedCardIndex(-1);
    setIsKeyboardNavigation(false);
  }, [filteredResults]);

  // Get unique museums from current results for filter dropdown
  const availableMuseums = [...new Set(searchResults.map(artwork => artwork.museum).filter(Boolean))];
  
    // Always include the working museums in dropdown even if no current results
  const allMuseums = [...new Set([
    ...availableMuseums,
    'Art Institute of Chicago',
    'Metropolitan Museum of Art',
    'Rijksmuseum'
  ])].sort();

  // Get unique art types from current results for filter dropdown
  const availableArtTypes = [...new Set(
    searchResults.map(artwork => {
      const artType = artwork.artworkType || artwork.medium || '';
      const department = artwork.department || '';
      
      // Clean up and standardize common art types
      const cleanType = artType.toLowerCase().trim();
      const cleanDept = department.toLowerCase().trim();
      
      // Paintings
      if (cleanType.includes('painting') || cleanType.includes('oil') || cleanType.includes('acrylic') || cleanType.includes('watercolor') || cleanType.includes('tempera')) return 'Painting';
      
      // Sculptures
      if (cleanType.includes('sculpture') || cleanType.includes('bronze') || cleanType.includes('marble') || cleanType.includes('stone') || cleanType.includes('carving')) return 'Sculpture';
      
      // Works on Paper
      if (cleanType.includes('drawing') || cleanType.includes('sketch') || cleanType.includes('charcoal') || cleanType.includes('pastel') || cleanType.includes('graphite')) return 'Drawing';
      if (cleanType.includes('print') || cleanType.includes('etching') || cleanType.includes('lithograph') || cleanType.includes('engraving') || cleanType.includes('woodcut')) return 'Print';
      
      // Photography
      if (cleanType.includes('photograph') || cleanType.includes('daguerreotype') || cleanType.includes('gelatin silver')) return 'Photography';
      
      // Decorative Arts
      if (cleanType.includes('ceramic') || cleanType.includes('pottery') || cleanType.includes('porcelain') || cleanType.includes('earthenware')) return 'Ceramics';
      if (cleanType.includes('textile') || cleanType.includes('fabric') || cleanType.includes('tapestry') || cleanType.includes('embroidery')) return 'Textiles';
      if (cleanType.includes('furniture') || cleanType.includes('chair') || cleanType.includes('table') || cleanType.includes('cabinet')) return 'Furniture';
      if (cleanType.includes('jewelry') || cleanType.includes('ring') || cleanType.includes('necklace') || cleanType.includes('bracelet')) return 'Jewelry';
      if (cleanType.includes('glass') || cleanType.includes('crystal') || cleanType.includes('vessel')) return 'Glass';
      if (cleanType.includes('metal') && !cleanType.includes('bronze')) return 'Metalwork';
      
      // Manuscripts and Books
      if (cleanType.includes('manuscript') || cleanType.includes('illuminated') || cleanType.includes('book') || cleanType.includes('folio')) return 'Manuscript';
      
      // Ancient and Archaeological
      if (cleanType.includes('vessel') || cleanType.includes('amphora') || cleanType.includes('vase') || cleanDept.includes('ancient')) return 'Ancient Art';
      
      // Contemporary and Modern
      if (cleanType.includes('installation') || cleanType.includes('conceptual') || cleanType.includes('performance')) return 'Contemporary Art';
      if (cleanType.includes('collage') || cleanType.includes('assemblage') || cleanType.includes('mixed media')) return 'Mixed Media';
      
      // Architecture and Design
      if (cleanType.includes('architectural') || cleanType.includes('design') || cleanDept.includes('design')) return 'Design';
      
      // Catch-all for specific types
      if (artType && artType.trim() && artType.length > 2) {
        // Capitalize first letter of each word
        return artType.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      
      return null;
    }).filter(Boolean)
  )].sort();

  const handleSearch = async (searchTerm) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setCurrentSearchTerm(searchTerm);
    setIsMuseumMode(false); // Reset museum mode for regular searches
    setHasMoreResults(false);

    try {
      console.log("Searching for:", searchTerm);

      // Use real museum APIs
      const results = await searchAllMuseums(searchTerm, 10);
      console.log('All search results:', results);
      console.log('Results by museum:', results.reduce((acc, artwork) => {
        acc[artwork.museum] = (acc[artwork.museum] || 0) + 1;
        return acc;
      }, {}));
      
      setSearchResults(results);

      if (results.length === 0) {
        setError("No artworks found. Some museum APIs may be temporarily unavailable. Try a different search term or try again later.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError("Search failed. Please try again later.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMuseumSearch = async (museumName) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setCurrentSearchTerm(`${museumName} Collection`);
    setIsMuseumMode(true);
    setSearchTermIndex(0);
    setHasMoreResults(true);

    try {
      console.log("Searching infinite museum collection for:", museumName);

      // Use the infinite search function
      const result = await searchInfiniteMuseumCollection(0, 50);
      setSearchResults(result.artworks);
      setSearchTermIndex(result.nextSearchIndex);
      setHasMoreResults(result.hasMore);

      // Set the museum filter to the specified museum
      setTimeout(() => {
        console.log('Setting museum filter to:', museumName);
        setFilterMuseum(museumName);
      }, 100);

      if (result.artworks.length === 0) {
        setError("No artworks found for this museum.");
      }
    } catch (error) {
      console.error("Museum search failed:", error);
      setError("Search failed. Please try again later.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more results for infinite scroll
  const loadMoreResults = async () => {
    if (isLoadingMore || !hasMoreResults || !isMuseumMode) return;

    setIsLoadingMore(true);

    try {
      const result = await searchInfiniteMuseumCollection(searchTermIndex, 50);
      
      // Append new results to existing ones
      setSearchResults(prev => {
        const newResults = [...prev, ...result.artworks];
        // Remove duplicates
        const uniqueResults = newResults.filter((artwork, index, self) => 
          index === self.findIndex(a => a.id === artwork.id)
        );
        return uniqueResults;
      });
      
      setSearchTermIndex(result.nextSearchIndex);
      setHasMoreResults(result.hasMore);
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 1000) {
        loadMoreResults();
      }
    };

    if (isMuseumMode) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMuseumMode, isLoadingMore, hasMoreResults, searchTermIndex]);

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
      {/* Skip navigation links for accessibility */}
      <nav className="skip-nav" aria-label="Skip navigation">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <a href="#search-results" className="skip-link">Skip to search results</a>
      </nav>
      
      <header className="search-header">
        <div className="nav-links">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <Link to="/collection" className="collection-link">
            My Collection →
          </Link>
        </div>
        <div className="header-content">
          <h1>Browse Artworks</h1>
          {searchParams.get('museum') ? (
            <p className="museum-subtitle">Exploring {searchParams.get('museum')}</p>
          ) : (
            <p>Discover masterpieces from world-renowned museums</p>
          )}
        </div>
      </header>

      <main id="main-content" role="main">
        <SearchBar 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          initialValue={currentSearchTerm}
        />

        <div className="search-results" id="search-results" role="region" aria-label="Search results">
          {/* Live region for screen reader announcements */}
          <div aria-live="polite" aria-atomic="false" className="sr-only" id="results-status">
            {hasSearched && !isLoading && (
              `Found ${filteredResults.length} artwork${filteredResults.length !== 1 ? 's' : ''} ${currentSearchTerm ? `for "${currentSearchTerm}"` : ''}`
            )}
            {isLoading && "Searching for artworks..."}
            {error && `Error: ${error}`}
          </div>
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
              
              <div className="filters-container" role="region" aria-label="Filter and sort options">
                <div className="filter-group" role="group" aria-labelledby="sort-label">
                  <label id="sort-label" htmlFor="sort-select">Sort by:</label>
                  <select 
                    id="sort-select"
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                    aria-describedby="sort-help"
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
                    {allMuseums.map(museum => (
                      <option key={museum} value={museum}>{museum}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="arttype-filter">Art Type:</label>
                  <select 
                    id="arttype-filter"
                    value={filterArtType} 
                    onChange={(e) => setFilterArtType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    {availableArtTypes.map(artType => (
                      <option key={artType} value={artType}>{artType}</option>
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
            
            <div 
              className="artwork-grid"
              role="grid"
              aria-label="Search results for artworks"
              tabIndex={0}
              onFocus={() => {
                setIsKeyboardNavigation(true);
                if (focusedCardIndex === -1 && filteredResults.length > 0) {
                  setFocusedCardIndex(0);
                }
              }}
            >
              {filteredResults.map((artwork, index) => (
                <div 
                  key={artwork.id} 
                  className={`artwork-card ${focusedCardIndex === index ? 'keyboard-focused' : ''}`}
                  role="gridcell"
                  tabIndex={focusedCardIndex === index ? 0 : -1}
                  aria-describedby={`artwork-${artwork.id}-description`}
                  onFocus={() => {
                    setIsKeyboardNavigation(true);
                    setFocusedCardIndex(index);
                  }}
                >
                  <div className="artwork-image">
                    {artwork.thumbnailUrl ? (
                      <img
                        src={artwork.thumbnailUrl}
                        alt={`${artwork.title} by ${artwork.artist || 'Unknown artist'}`}
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
                      aria-label="No image available"
                    >
                      <span>No Image</span>
                    </div>
                  </div>

                  <div className="artwork-info">
                    <h3>{artwork.title}</h3>
                    <p className="artist">{artwork.artist}</p>
                    <p className="date">{artwork.date}</p>
                    <p className="museum">{artwork.museum}</p>
                    
                    {/* Hidden description for screen readers */}
                    <div id={`artwork-${artwork.id}-description`} className="sr-only">
                      Artwork: {artwork.title} by {artwork.artist || 'Unknown artist'}, 
                      {artwork.date && ` created ${artwork.date},`} 
                      from {artwork.museum}. 
                      {focusedCardIndex === index ? 'Press Enter to view details or Escape to exit navigation.' : ''}
                    </div>

                    <div className="artwork-actions">
                      <Link
                        to={`/artwork/${artwork.id}?from=search&q=${encodeURIComponent(currentSearchTerm)}`}
                        className="view-details-btn"
                        aria-label={`View details for ${artwork.title} by ${artwork.artist || 'Unknown artist'}`}
                      >
                        View Details
                      </Link>
                      <button
                        onClick={(e) => handleAddToCollection(e, artwork)}
                        className={`add-to-collection-btn ${collectionItems.has(artwork.id) ? 'in-collection' : ''}`}
                        aria-label={collectionItems.has(artwork.id) 
                          ? `Remove ${artwork.title} from collection` 
                          : `Add ${artwork.title} to collection`}
                        aria-pressed={collectionItems.has(artwork.id)}
                      >
                        {collectionItems.has(artwork.id) ? '✓ In Collection' : 'Add to Collection'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Infinite scroll loading indicator */}
            {isMuseumMode && isLoadingMore && (
              <div className="loading-more">
                <div className="spinner"></div>
                <p>Loading more artworks...</p>
              </div>
            )}
            
            {isMuseumMode && !hasMoreResults && searchResults.length > 0 && (
              <div className="end-of-results">
                <p>✨ You've explored the entire collection! ✨</p>
                <p>Found {filteredResults.length} amazing artworks total.</p>
              </div>
            )}
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
              <p>Searching across:</p>
              <ul>
                <li>Art Institute of Chicago</li>
                <li>Metropolitan Museum of Art</li>
                <li>Rijksmuseum</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}

export default Search;
