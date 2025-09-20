import { Link } from 'react-router-dom'

function Search() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Browse Artworks</h1>
      <p>Search functionality coming soon...</p>
      <Link to="/" style={{ color: '#667eea', textDecoration: 'none' }}>
        ← Back to Home
      </Link>
    </div>
  )
}

export default Search