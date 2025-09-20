import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import './Search.css'

function Search() {
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (searchTerm) => {
    setIsLoading(true)
    setHasSearched(true)
    
    try {
      // TODO: Implement actual API calls here
      console.log('Searching for:', searchTerm)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock results for now
      setSearchResults([
        { id: 1, title: `Sample artwork for "${searchTerm}"`, artist: 'Artist Name' },
        { id: 2, title: `Another artwork for "${searchTerm}"`, artist: 'Another Artist' }
      ])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="search-page">
      <header className="search-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>Browse Artworks</h1>
        <p>Discover masterpieces from world-renowned museums</p>
      </header>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <div className="search-results">
        {isLoading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Searching artworks...</p>
          </div>
        )}

        {!isLoading && hasSearched && searchResults.length === 0 && (
          <div className="no-results">
            <p>No artworks found. Try a different search term.</p>
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div className="results-grid">
            <h2>Search Results ({searchResults.length})</h2>
            <div className="artwork-grid">
              {searchResults.map(artwork => (
                <div key={artwork.id} className="artwork-card">
                  <div className="artwork-placeholder">
                    <span>Image</span>
                  </div>
                  <h3>{artwork.title}</h3>
                  <p>{artwork.artist}</p>
                  <button className="view-details-btn">View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasSearched && (
          <div className="search-prompt">
            <h2>Start your art discovery</h2>
            <p>Use the search bar above to find artworks by title, artist, or keyword</p>
            <p>Or try one of the quick search options to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search