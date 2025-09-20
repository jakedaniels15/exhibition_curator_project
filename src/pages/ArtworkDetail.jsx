import { useParams, Link } from 'react-router-dom'

function ArtworkDetail() {
  const { id } = useParams()
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Artwork Detail</h1>
      <p>Artwork ID: {id}</p>
      <p>Detailed artwork view coming soon...</p>
      <Link to="/search" style={{ color: '#667eea', textDecoration: 'none' }}>
        ← Back to Search
      </Link>
    </div>
  )
}

export default ArtworkDetail