import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <header className="home-header">
        <h1 className="app-title">MyMuseum</h1>
        <p className="app-tagline">
          Create your own personalised exhibition from the world's most famous galleries
        </p>
      </header>

      <nav className="home-nav">
        <Link to="/collection" className="collection-button">
          View My Collection
        </Link>
      </nav>

      <section className="museums-section">
        <h2>Museums You Can Explore</h2>
        <div className="museums-list">
          <div className="museum-card">
            <h3>Art Institute of Chicago</h3>
            <p>Explore masterpieces from one of America's premier art museums</p>
          </div>
          <div className="museum-card">
            <h3>Metropolitan Museum of Art</h3>
            <p>Discover treasures from New York's iconic cultural institution</p>
          </div>
        </div>
        <Link to="/search" className="browse-button">
          Browse Artworks
        </Link>
      </section>
    </div>
  )
}

export default Home