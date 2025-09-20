import { useState, useRef } from "react";
import "./ImageMagnifier.css";

function ImageMagnifier({ src, alt, magnifierSize = 150, zoomLevel = 2.5 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [magnifierStyle, setMagnifierStyle] = useState({});
  const imageRef = useRef(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate magnifier position
    const magnifierX = e.clientX - magnifierSize / 2;
    const magnifierY = e.clientY - magnifierSize / 2;

    // Calculate background position for zoom effect
    const backgroundX = -(x * zoomLevel - magnifierSize / 2);
    const backgroundY = -(y * zoomLevel - magnifierSize / 2);

    setPosition({ x: magnifierX, y: magnifierY });
    setMagnifierStyle({
      backgroundImage: `url(${src})`,
      backgroundSize: `${rect.width * zoomLevel}px ${
        rect.height * zoomLevel
      }px`,
      backgroundPosition: `${backgroundX}px ${backgroundY}px`,
      left: `${magnifierX}px`,
      top: `${magnifierY}px`,
    });
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "flex";
  };

  return (
    <div className="image-magnifier">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="magnifier-image"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onError={handleImageError}
      />

      <div className="image-placeholder" style={{ display: "none" }}>
        <span>Image not available</span>
      </div>

      {isVisible && (
        <div
          className="magnifier-glass"
          style={{
            ...magnifierStyle,
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
          }}
        />
      )}

      <div className="magnifier-hint">
        <span>Hover to magnify</span>
      </div>
    </div>
  );
}

export default ImageMagnifier;
