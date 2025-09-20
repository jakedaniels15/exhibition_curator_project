// Collection management service using localStorage
const COLLECTION_KEY = 'museum_collection';

export const collectionService = {
  // Get all items from collection
  getCollection: () => {
    try {
      const collection = localStorage.getItem(COLLECTION_KEY);
      return collection ? JSON.parse(collection) : [];
    } catch (error) {
      console.error('Error getting collection:', error);
      return [];
    }
  },

  // Add artwork to collection
  addToCollection: (artwork) => {
    try {
      const collection = collectionService.getCollection();
      
      // Check if artwork already exists (avoid duplicates)
      const exists = collection.find(item => item.id === artwork.id);
      if (exists) {
        return { success: false, message: 'Artwork already in collection' };
      }

      // Add artwork with timestamp
      const artworkWithTimestamp = {
        ...artwork,
        addedAt: new Date().toISOString()
      };

      collection.push(artworkWithTimestamp);
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
      
      return { success: true, message: 'Added to collection' };
    } catch (error) {
      console.error('Error adding to collection:', error);
      return { success: false, message: 'Failed to add to collection' };
    }
  },

  // Remove artwork from collection
  removeFromCollection: (artworkId) => {
    try {
      const collection = collectionService.getCollection();
      const filteredCollection = collection.filter(item => item.id !== artworkId);
      
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(filteredCollection));
      return { success: true, message: 'Removed from collection' };
    } catch (error) {
      console.error('Error removing from collection:', error);
      return { success: false, message: 'Failed to remove from collection' };
    }
  },

  // Check if artwork is in collection
  isInCollection: (artworkId) => {
    try {
      const collection = collectionService.getCollection();
      return collection.some(item => item.id === artworkId);
    } catch (error) {
      console.error('Error checking collection:', error);
      return false;
    }
  },

  // Clear entire collection
  clearCollection: () => {
    try {
      localStorage.removeItem(COLLECTION_KEY);
      return { success: true, message: 'Collection cleared' };
    } catch (error) {
      console.error('Error clearing collection:', error);
      return { success: false, message: 'Failed to clear collection' };
    }
  }
};