import { searchArtworksAIC, getArtworkDetailsAIC } from './aicApi.js'
import { searchArtworksMet, getArtworkDetailsMet } from './metApi.js'

// Combined search function that queries both museums
export const searchAllMuseums = async (query, limitPerMuseum = 10) => {
  try {
    // Search both APIs in parallel
    const [aicResults, metResults] = await Promise.allSettled([
      searchArtworksAIC(query, limitPerMuseum),
      searchArtworksMet(query, limitPerMuseum)
    ])
    
    // Combine results, handling any failures gracefully
    const allResults = []
    
    if (aicResults.status === 'fulfilled') {
      allResults.push(...aicResults.value)
    } else {
      console.warn('AIC search failed:', aicResults.reason)
    }
    
    if (metResults.status === 'fulfilled') {
      allResults.push(...metResults.value)
    } else {
      console.warn('Met search failed:', metResults.reason)
    }
    
    // Shuffle results to mix artworks from both museums
    return shuffleArray(allResults)
  } catch (error) {
    console.error('Error in combined museum search:', error)
    throw error
  }
}

// Get artwork details from the appropriate museum based on ID prefix
export const getArtworkDetails = async (artworkId) => {
  try {
    if (artworkId.startsWith('aic-')) {
      return await getArtworkDetailsAIC(artworkId)
    } else if (artworkId.startsWith('met-')) {
      return await getArtworkDetailsMet(artworkId)
    } else {
      throw new Error(`Unknown artwork ID format: ${artworkId}`)
    }
  } catch (error) {
    console.error('Error getting artwork details:', error)
    throw error
  }
}

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Search specific museum
export const searchMuseum = async (query, museum, limit = 20) => {
  try {
    switch (museum.toLowerCase()) {
      case 'aic':
      case 'art institute of chicago':
        return await searchArtworksAIC(query, limit)
      case 'met':
      case 'metropolitan museum':
      case 'metropolitan museum of art':
        return await searchArtworksMet(query, limit)
      default:
        throw new Error(`Unknown museum: ${museum}`)
    }
  } catch (error) {
    console.error(`Error searching ${museum}:`, error)
    throw error
  }
}