import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Collection from "./pages/Collection";
import ArtworkDetail from "./pages/ArtworkDetail";
import Exhibition from "./pages/Exhibition";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/exhibition" element={<Exhibition />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
