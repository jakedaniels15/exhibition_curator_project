// Smithsonian Institution API Service
const SMITHSONIAN_BASE_URL = "https://api.si.edu/openaccess/api/v1.0";

export const searchArtworksSmithsonian = async (query, limit = 20) => {
  try {
    console.log('Smithsonian API: Searching for:', query);
    
    const response = await fetch(
      `${SMITHSONIAN_BASE_URL}/search?q=${encodeURIComponent(
        query
      )}&start=0&rows=${limit}&api_key=DEMO_KEY&fqs=online_media_type:"Images"`
    );

    if (!response.ok) {
      console.error(`Smithsonian API error: ${response.status}`);
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    console.log('Smithsonian API raw response:', data);

    // Handle both possible response structures
    const items = data.response?.rows || data.response?.docs || [];
    
    if (items.length === 0) {
      console.log('No results found in Smithsonian API');
      return [];
    }

    // Transform the data to our standardized format
    const results = items.map((artwork) => {
      try {
        return {
          id: `smithsonian-${artwork.id || artwork.url || Date.now()}`,
          title: artwork.title || "Untitled",
          artist: artwork.content?.indexedStructured?.name?.[0] || 
                  artwork.content?.freetext?.name?.[0]?.content || 
                  "Unknown Artist",
          date: artwork.content?.indexedStructured?.date?.[0] || 
                artwork.content?.freetext?.date?.[0]?.content || 
                "Date unknown",
          medium: artwork.content?.indexedStructured?.medium?.[0] || 
                  artwork.content?.freetext?.physicalDescription?.[0]?.content || 
                  "Medium unknown",
          museum: artwork.unitCode ? getMuseumName(artwork.unitCode) : "Smithsonian Institution",
          museumCode: "SMITHSONIAN",
          imageUrl: artwork.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.content || 
                    artwork.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.idsId || 
                    null,
          thumbnailUrl: artwork.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.thumbnail || 
                        artwork.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.content || 
                        null,
          department: artwork.content?.indexedStructured?.topic?.[0] || null,
          artworkType: artwork.content?.indexedStructured?.object_type?.[0] || 
                       artwork.content?.indexedStructured?.type?.[0] || null,
          placeOfOrigin: artwork.content?.indexedStructured?.place?.[0] || 
                         artwork.content?.indexedStructured?.culture?.[0] || null,
          gallery: null,
          museumUrl: artwork.content?.descriptiveNonRepeating?.record_link || 
                     `https://collections.si.edu/search/detail/edanmdm:${artwork.id}`,
          originalData: artwork,
        };
      } catch (itemError) {
        console.warn('Error processing Smithsonian item:', itemError, artwork);
        return null;
      }
    }).filter(item => item !== null); // Remove any failed items
    
    console.log('Smithsonian API processed results:', results.length, 'items');
    if (results.length > 0) {
      console.log('Sample result:', results[0]);
    }
    
    return results;
  } catch (error) {
    console.error("Error fetching from Smithsonian API:", error);
    return []; // Return empty array instead of throwing
  }
};

export const getArtworkDetailsSmithsonian = async (artworkId) => {
  try {
    // Remove 'smithsonian-' prefix if present
    const cleanId = artworkId.replace("smithsonian-", "");

    const response = await fetch(
      `${SMITHSONIAN_BASE_URL}/content/${cleanId}?api_key=DEMO_KEY`
    );

    if (!response.ok) {
      throw new Error(`Smithsonian API error: ${response.status}`);
    }

    const result = await response.json();
    const artwork = result.response;

    if (!artwork) {
      throw new Error("Artwork not found");
    }

    return {
      id: `smithsonian-${artwork.id}`,
      title: artwork.title || "Untitled",
      artist: artwork.content?.indexedStructured?.name?.[0] || 
              artwork.content?.freetext?.name?.[0]?.content || 
              "Unknown Artist",
      date: artwork.content?.indexedStructured?.date?.[0] || 
            artwork.content?.freetext?.date?.[0]?.content || 
            "Date unknown",
      medium: artwork.content?.indexedStructured?.medium?.[0] || 
              artwork.content?.freetext?.physicalDescription?.[0]?.content || 
              "Medium unknown",
      dimensions: artwork.content?.freetext?.physicalDescription?.[0]?.content || 
                  "Dimensions unknown",
      museum: artwork.unitCode ? getMuseumName(artwork.unitCode) : "Smithsonian Institution",
      museumCode: "SMITHSONIAN",
      imageUrl: artwork.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.content || null,
      thumbnailUrl: artwork.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.thumbnail || null,
      department: artwork.content?.indexedStructured?.topic?.[0] || null,
      artworkType: artwork.content?.indexedStructured?.object_type?.[0] || 
                   artwork.content?.indexedStructured?.type?.[0] || null,
      placeOfOrigin: artwork.content?.indexedStructured?.place?.[0] || 
                     artwork.content?.indexedStructured?.culture?.[0] || null,
      gallery: null,
      period: artwork.content?.indexedStructured?.date?.[0] || null,
      culture: artwork.content?.indexedStructured?.culture?.[0] || null,
      creditLine: artwork.content?.freetext?.creditLine?.[0]?.content || null,
      accessionNumber: artwork.content?.indexedStructured?.record_ID?.[0] || null,
      description: artwork.content?.freetext?.notes?.[0]?.content || 
                   artwork.content?.freetext?.summary?.[0]?.content || null,
      subjects: artwork.content?.indexedStructured?.topic?.slice(0, 8) || [],
      materials: artwork.content?.indexedStructured?.medium?.slice(0, 6) || [],
      museumUrl: artwork.content?.descriptiveNonRepeating?.record_link || 
                 `https://collections.si.edu/search/detail/edanmdm:${artwork.id}`,
      originalData: artwork,
    };
  } catch (error) {
    console.error("Error fetching Smithsonian artwork details:", error);
    return null; // Return null instead of throwing
  }
};

// Helper function to get museum name from unit code
const getMuseumName = (unitCode) => {
  const museumMap = {
    'NASM': 'National Air and Space Museum',
    'NMNH': 'National Museum of Natural History',
    'NPG': 'National Portrait Gallery',
    'SAAM': 'Smithsonian American Art Museum',
    'NMAH': 'National Museum of American History',
    'ACM': 'Anacostia Community Museum',
    'CHNDM': 'Cooper Hewitt, Smithsonian Design Museum',
    'FGA': 'Freer Gallery of Art',
    'HMSG': 'Hirshhorn Museum and Sculpture Garden',
    'NAA': 'National Anthropological Archives',
    'NMAAHC': 'National Museum of African American History and Culture',
    'NMAI': 'National Museum of the American Indian',
    'NPM': 'National Postal Museum',
    'NZP': 'National Zoo',
    'SAAM': 'Smithsonian American Art Museum',
    'SIA': 'Smithsonian Institution Archives',
    'SIL': 'Smithsonian Institution Libraries'
  };
  
  return museumMap[unitCode] || 'Smithsonian Institution';
};