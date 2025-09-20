// Metropolitan Museum of Art API Service
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1'

export const searchArtworksMet = async (query, limit = 20) => {
  try {
    // First, search for object IDs
    const searchResponse = await fetch(
      `${MET_BASE_URL}/search?hasImages=true&q=${encodeURIComponent(query)}`
    )
    
    if (!searchResponse.ok) {
      throw new Error(`Met API search error: ${searchResponse.status}`)
    }
    
    const searchData = await searchResponse.json()
    
    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return []
    }
    
    // Get details for the first batch of objects (limited by limit parameter)
    const objectIds = searchData.objectIDs.slice(0, limit)
    const artworkPromises = objectIds.map(id => getArtworkDetailsMet(`met-${id}`))
    
    // Fetch all artworks in parallel, but handle failures gracefully
    const results = await Promise.allSettled(artworkPromises)
    
    // Filter out failed requests and return successful ones
    return results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value)
  } catch (error) {
    console.error('Error fetching from Met API:', error)
    throw error
  }
}

export const getArtworkDetailsMet = async (artworkId) => {
  try {
    // Remove 'met-' prefix if present
    const cleanId = artworkId.replace('met-', '')
    
    const response = await fetch(`${MET_BASE_URL}/objects/${cleanId}`)
    
    if (!response.ok) {
      throw new Error(`Met API error: ${response.status}`)
    }
    
    const artwork = await response.json()
    
    // Skip artworks without images
    if (!artwork.primaryImage && !artwork.primaryImageSmall) {
      return null
    }
    
    return {
      id: `met-${artwork.objectID}`,
      title: artwork.title || 'Untitled',
      artist: artwork.artistDisplayName || artwork.artistDisplayBio || 'Unknown Artist',
      date: artwork.objectDate || artwork.objectBeginDate ? `${artwork.objectBeginDate}` : 'Date unknown',
      medium: artwork.medium || artwork.classification || 'Medium unknown',
      dimensions: artwork.dimensions || 'Dimensions unknown',
      museum: 'Metropolitan Museum of Art',
      museumCode: 'MET',
      imageUrl: artwork.primaryImage || null,
      thumbnailUrl: artwork.primaryImageSmall || artwork.primaryImage || null,
      department: artwork.department,
      artworkType: artwork.classification,
      placeOfOrigin: artwork.country || artwork.culture || artwork.region,
      gallery: artwork.gallerNumber ? `Gallery ${artwork.gallerNumber}` : null,
      period: artwork.period,
      dynasty: artwork.dynasty,
      culture: artwork.culture,
      creditLine: artwork.creditLine,
      accessionNumber: artwork.accessionNumber,
      isPublicDomain: artwork.isPublicDomain,
      museumUrl: artwork.objectURL || `https://www.metmuseum.org/art/collection/search/${artwork.objectID}`,
      originalData: artwork
    }
  } catch (error) {
    console.error('Error fetching artwork details from Met API:', error)
    return null // Return null for failed requests so they can be filtered out
  }
}