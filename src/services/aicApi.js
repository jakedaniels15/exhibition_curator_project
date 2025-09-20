// Art Institute of Chicago API Service
const AIC_BASE_URL = 'https://api.artic.edu/api/v1'

export const searchArtworksAIC = async (query, limit = 20) => {
  try {
    const response = await fetch(
      `${AIC_BASE_URL}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=id,title,artist_display,date_display,medium_display,image_id,thumbnail,place_of_origin,department_title,artwork_type_title,gallery_title`
    )
    
    if (!response.ok) {
      throw new Error(`AIC API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform the data to our standardized format
    return data.data.map(artwork => ({
      id: `aic-${artwork.id}`,
      title: artwork.title || 'Untitled',
      artist: artwork.artist_display || 'Unknown Artist',
      date: artwork.date_display || 'Date unknown',
      medium: artwork.medium_display || 'Medium unknown',
      museum: 'Art Institute of Chicago',
      museumCode: 'AIC',
      imageUrl: artwork.image_id 
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
        : null,
      thumbnailUrl: artwork.image_id 
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`
        : null,
      department: artwork.department_title,
      artworkType: artwork.artwork_type_title,
      placeOfOrigin: artwork.place_of_origin,
      gallery: artwork.gallery_title,
      museumUrl: `https://www.artic.edu/artworks/${artwork.id}`,
      originalData: artwork
    }))
  } catch (error) {
    console.error('Error fetching from AIC API:', error)
    throw error
  }
}

export const getArtworkDetailsAIC = async (artworkId) => {
  try {
    // Remove 'aic-' prefix if present
    const cleanId = artworkId.replace('aic-', '')
    
    const response = await fetch(
      `${AIC_BASE_URL}/artworks/${cleanId}?fields=id,title,artist_display,date_display,medium_display,dimensions,image_id,thumbnail,place_of_origin,department_title,artwork_type_title,gallery_title,style_title,classification_title,subject_titles,material_titles,technique_titles,credit_line,publication_history,exhibition_history,provenance_text,description,short_description`
    )
    
    if (!response.ok) {
      throw new Error(`AIC API error: ${response.status}`)
    }
    
    const result = await response.json()
    const artwork = result.data
    
    return {
      id: `aic-${artwork.id}`,
      title: artwork.title || 'Untitled',
      artist: artwork.artist_display || 'Unknown Artist',
      date: artwork.date_display || 'Date unknown',
      medium: artwork.medium_display || 'Medium unknown',
      dimensions: artwork.dimensions || 'Dimensions unknown',
      museum: 'Art Institute of Chicago',
      museumCode: 'AIC',
      imageUrl: artwork.image_id 
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
        : null,
      thumbnailUrl: artwork.image_id 
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`
        : null,
      department: artwork.department_title,
      artworkType: artwork.artwork_type_title,
      placeOfOrigin: artwork.place_of_origin,
      gallery: artwork.gallery_title,
      style: artwork.style_title,
      classification: artwork.classification_title,
      subjects: artwork.subject_titles || [],
      materials: artwork.material_titles || [],
      techniques: artwork.technique_titles || [],
      creditLine: artwork.credit_line,
      description: artwork.description || artwork.short_description,
      museumUrl: `https://www.artic.edu/artworks/${artwork.id}`,
      originalData: artwork
    }
  } catch (error) {
    console.error('Error fetching artwork details from AIC API:', error)
    throw error
  }
}