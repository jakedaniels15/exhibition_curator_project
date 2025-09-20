import { Link } from 'react-router-dom'

function Collection() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>My Collection</h1>
      <p>Your saved artworks will appear here...</p>
      <Link to="/" style={{ color: '#667eea', textDecoration: 'none' }}>
        ← Back to Home
      </Link>
    </div>
  )
}

export default Collection