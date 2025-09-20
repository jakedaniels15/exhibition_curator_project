// Rijksmuseum API Service (Netherlands National Museum)
const RIJKS_BASE_URL = "https://www.rijksmuseum.nl/api/nl/collection";
const RIJKS_API_KEY = "0fiuZFh4"; // Public demo key

export const searchArtworksRijks = async (query, limit = 20) => {
  try {
    console.log('Rijksmuseum API: Searching for:', query);
    
    const response = await fetch(
      `${RIJKS_BASE_URL}?key=${RIJKS_API_KEY}&q=${encodeURIComponent(
        query
      )}&ps=${limit}&imgonly=true&format=json`
    );

    if (!response.ok) {
      console.error(`Rijksmuseum API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    if (!data.artObjects || data.artObjects.length === 0) {
      console.log('Rijksmuseum API: No results found');
      return [];
    }

    // Transform the data to our standardized format
    const results = data.artObjects.map((artwork) => ({
      id: `rijks-${artwork.objectNumber}`,
      title: artwork.title || "Untitled",
      artist: artwork.principalOrFirstMaker || "Unknown Artist",
      date: artwork.dating?.presentingDate || "Date unknown",
      medium: artwork.physicalMedium || "Medium unknown",
      museum: "Rijksmuseum",
      museumCode: "RIJKS",
      imageUrl: artwork.webImage?.url || artwork.headerImage?.url || null,
      thumbnailUrl: artwork.webImage?.url || artwork.headerImage?.url || null,
      department: artwork.classification?.iconClassDescription?.[0] || null,
      artworkType: artwork.objectTypes?.[0] || null,
      placeOfOrigin: artwork.productionPlaces?.[0] || null,
      gallery: null,
      museumUrl: artwork.links?.web || `https://www.rijksmuseum.nl/nl/collectie/${artwork.objectNumber}`,
      originalData: artwork,
    }));

    console.log('Rijksmuseum API: Successfully retrieved', results.length, 'artworks');
    return results;
  } catch (error) {
    console.error("Error fetching from Rijksmuseum API:", error);
    return [];
  }
};

export const getArtworkDetailsRijks = async (artworkId) => {
  try {
    // Remove 'rijks-' prefix if present
    const cleanId = artworkId.replace("rijks-", "");

    const response = await fetch(
      `${RIJKS_BASE_URL}/${cleanId}?key=${RIJKS_API_KEY}&format=json`
    );

    if (!response.ok) {
      console.warn(`Rijksmuseum API details error: ${response.status} for ID ${cleanId}`);
      return null;
    }

    const result = await response.json();
    const artwork = result.artObject;

    if (!artwork) {
      throw new Error("Artwork not found");
    }

    return {
      id: `rijks-${artwork.objectNumber}`,
      title: artwork.title || "Untitled",
      artist: artwork.principalMakers?.[0]?.name || artwork.principalOrFirstMaker || "Unknown Artist",
      date: artwork.dating?.presentingDate || "Date unknown",
      medium: artwork.physicalMedium || "Medium unknown",
      dimensions: artwork.subTitle || "Dimensions unknown",
      museum: "Rijksmuseum",
      museumCode: "RIJKS",
      imageUrl: artwork.webImage?.url || null,
      thumbnailUrl: artwork.webImage?.url || null,
      department: artwork.classification?.iconClassDescription?.[0] || null,
      artworkType: artwork.objectTypes?.[0] || null,
      placeOfOrigin: artwork.productionPlaces?.[0] || null,
      gallery: artwork.location || null,
      period: artwork.dating?.period || null,
      culture: artwork.principalMakers?.[0]?.nationality || null,
      creditLine: artwork.acquisition?.creditLine || null,
      accessionNumber: artwork.objectNumber || null,
      description: artwork.plaqueDescriptionEnglish || artwork.description || null,
      subjects: artwork.classification?.iconClassDescription?.slice(0, 8) || [],
      materials: artwork.materials || [],
      museumUrl: artwork.links?.web || `https://www.rijksmuseum.nl/nl/collectie/${artwork.objectNumber}`,
      originalData: artwork,
    };
  } catch (error) {
    console.error("Error fetching Rijksmuseum artwork details:", error);
    return null;
  }
};