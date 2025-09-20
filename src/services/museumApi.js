import { searchArtworksAIC, getArtworkDetailsAIC } from "./aicApi.js";
import { searchArtworksMet, getArtworkDetailsMet } from "./metApi.js";
import { searchArtworksSmithsonian, getArtworkDetailsSmithsonian } from "./smithsonianApi.js";

// Combined search function that queries all museums
export const searchAllMuseums = async (query, limitPerMuseum = 10) => {
  try {
    // Search all APIs in parallel
    const [aicResults, metResults, smithsonianResults] = await Promise.allSettled([
      searchArtworksAIC(query, limitPerMuseum),
      searchArtworksMet(query, limitPerMuseum),
      searchArtworksSmithsonian(query, limitPerMuseum),
    ]);

    // Combine results, handling any failures gracefully
    const allResults = [];

    if (aicResults.status === "fulfilled") {
      allResults.push(...aicResults.value);
    } else {
      console.warn("AIC search failed:", aicResults.reason);
    }

    if (metResults.status === "fulfilled") {
      allResults.push(...metResults.value);
    } else {
      console.warn("Met search failed:", metResults.reason);
    }

    if (smithsonianResults.status === "fulfilled") {
      allResults.push(...smithsonianResults.value);
    } else {
      console.warn("Smithsonian search failed:", smithsonianResults.reason);
    }

    // Shuffle results to mix artworks from all museums
    return shuffleArray(allResults);
  } catch (error) {
    console.error("Error in combined museum search:", error);
    throw error;
  }
};

// Search for a broader collection from all museums using multiple terms with pagination support
export const searchMuseumCollection = async (limitPerMuseum = 20, page = 1) => {
  try {
    // Use multiple broad search terms to get a diverse collection
    const searchTerms = ['painting', 'sculpture', 'drawing', 'print', 'photograph', 'ceramic', 'textile', 'modern', 'contemporary', 'ancient'];
    
    // Calculate items per term based on page and limit
    const itemsPerTerm = Math.ceil(limitPerMuseum / searchTerms.length);
    
    const searchPromises = searchTerms.map(term => 
      searchAllMuseums(term, itemsPerTerm)
    );

    const results = await Promise.allSettled(searchPromises);
    
    // Combine all successful results
    const allResults = [];
    results.forEach(result => {
      if (result.status === "fulfilled") {
        allResults.push(...result.value);
      }
    });

    // Remove duplicates based on artwork ID
    const uniqueResults = allResults.filter((artwork, index, self) => 
      index === self.findIndex(a => a.id === artwork.id)
    );

    // Shuffle results for variety
    const shuffled = shuffleArray(uniqueResults);
    
    // Implement pagination
    const startIndex = (page - 1) * limitPerMuseum;
    const endIndex = startIndex + limitPerMuseum;
    
    return {
      artworks: shuffled.slice(startIndex, endIndex),
      hasMore: shuffled.length > endIndex,
      totalResults: shuffled.length
    };
  } catch (error) {
    console.error("Error in museum collection search:", error);
    throw error;
  }
};

// Infinite scroll version that fetches large batches
export const searchInfiniteMuseumCollection = async (searchTermIndex = 0, limit = 50) => {
  try {
    const searchTerms = [
      'painting', 'sculpture', 'drawing', 'print', 'photograph', 
      'ceramic', 'textile', 'modern', 'contemporary', 'ancient',
      'portrait', 'landscape', 'abstract', 'figurative', 'decorative',
      'bronze', 'marble', 'oil', 'watercolor', 'etching'
    ];
    
    // Use different search terms for each batch to get more variety
    const currentTerm = searchTerms[searchTermIndex % searchTerms.length];
    const results = await searchAllMuseums(currentTerm, limit);
    
    return {
      artworks: results,
      nextSearchIndex: searchTermIndex + 1,
      hasMore: searchTermIndex < searchTerms.length - 1 || results.length === limit
    };
  } catch (error) {
    console.error("Error in infinite museum collection search:", error);
    throw error;
  }
};

// Get artwork details from the appropriate museum based on ID prefix
export const getArtworkDetails = async (artworkId) => {
  try {
    if (artworkId.startsWith("aic-")) {
      return await getArtworkDetailsAIC(artworkId);
    } else if (artworkId.startsWith("met-")) {
      return await getArtworkDetailsMet(artworkId);
    } else if (artworkId.startsWith("smithsonian-")) {
      return await getArtworkDetailsSmithsonian(artworkId);
    } else {
      throw new Error(`Unknown artwork ID format: ${artworkId}`);
    }
  } catch (error) {
    console.error("Error getting artwork details:", error);
    throw error;
  }
};

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Search specific museum
export const searchMuseum = async (query, museum, limit = 20) => {
  try {
    switch (museum.toLowerCase()) {
      case "aic":
      case "art institute of chicago":
        return await searchArtworksAIC(query, limit);
      case "met":
      case "metropolitan museum":
      case "metropolitan museum of art":
        return await searchArtworksMet(query, limit);
      case "smithsonian":
      case "smithsonian institution":
        return await searchArtworksSmithsonian(query, limit);
      default:
        throw new Error(`Unknown museum: ${museum}`);
    }
  } catch (error) {
    console.error(`Error searching ${museum}:`, error);
    throw error;
  }
};
