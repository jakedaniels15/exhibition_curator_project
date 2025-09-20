import { Link } from "react-router-dom";

function Exhibition() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>My Exhibition</h1>
      <p>Your curated exhibition will be displayed here...</p>
      <Link
        to="/collection"
        style={{ color: "#667eea", textDecoration: "none" }}
      >
        ← Back to Collection
      </Link>
    </div>
  );
}

export default Exhibition;
