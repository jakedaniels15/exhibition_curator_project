import { collectionService } from '../collectionService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Collection Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('getCollection', () => {
    test('returns empty array when no collection exists', () => {
      const result = collectionService.getCollection();

      expect(result).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('museum_collection');
    });

    test('returns parsed collection from localStorage', () => {
      const mockCollection = [
        { id: '1', title: 'Test Artwork', artist: 'Test Artist' }
      ];
      localStorageMock.setItem('museum_collection', JSON.stringify(mockCollection));

      const result = collectionService.getCollection();

      expect(result).toEqual(mockCollection);
    });

    test('handles JSON parse errors gracefully', () => {
      localStorageMock.setItem('museum_collection', 'invalid json');
      
      // Mock console.error to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = collectionService.getCollection();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('addToCollection', () => {
    test('successfully adds new artwork to empty collection', () => {
      const artwork = {
        id: '1',
        title: 'Test Artwork',
        artist: 'Test Artist'
      };

      const result = collectionService.addToCollection(artwork);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Added to collection');
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Check that artwork was saved with timestamp
      const collection = collectionService.getCollection();
      expect(collection).toHaveLength(1);
      expect(collection[0]).toMatchObject(artwork);
      expect(collection[0].addedAt).toBeDefined();
    });

    test('prevents duplicate artworks', () => {
      const existingArtwork = { id: '1', title: 'Existing Artwork', addedAt: '2023-01-01' };
      localStorageMock.setItem('museum_collection', JSON.stringify([existingArtwork]));

      const duplicateArtwork = {
        id: '1',
        title: 'Existing Artwork',
        artist: 'Test Artist'
      };

      const result = collectionService.addToCollection(duplicateArtwork);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Artwork already in collection');
    });

    test('adds artwork to existing collection', () => {
      const existingArtwork = { id: '1', title: 'Existing Artwork', addedAt: '2023-01-01' };
      localStorageMock.setItem('museum_collection', JSON.stringify([existingArtwork]));

      const newArtwork = {
        id: '2',
        title: 'New Artwork',
        artist: 'New Artist'
      };

      const result = collectionService.addToCollection(newArtwork);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Added to collection');
      
      const collection = collectionService.getCollection();
      expect(collection).toHaveLength(2);
    });
  });

  describe('removeFromCollection', () => {
    test('successfully removes artwork from collection', () => {
      const collection = [
        { id: '1', title: 'Artwork 1' },
        { id: '2', title: 'Artwork 2' }
      ];
      localStorageMock.setItem('museum_collection', JSON.stringify(collection));

      const result = collectionService.removeFromCollection('1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Removed from collection');
      
      const updatedCollection = collectionService.getCollection();
      expect(updatedCollection).toHaveLength(1);
      expect(updatedCollection[0].id).toBe('2');
    });

    test('removes non-existent artwork without error', () => {
      const collection = [
        { id: '1', title: 'Artwork 1' }
      ];
      localStorageMock.setItem('museum_collection', JSON.stringify(collection));

      const result = collectionService.removeFromCollection('999');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Removed from collection');
    });
  });

  describe('isInCollection', () => {
    test('returns true for artwork in collection', () => {
      const collection = [
        { id: '1', title: 'Test Artwork' }
      ];
      localStorageMock.setItem('museum_collection', JSON.stringify(collection));

      const result = collectionService.isInCollection('1');

      expect(result).toBe(true);
    });

    test('returns false for artwork not in collection', () => {
      const collection = [
        { id: '1', title: 'Test Artwork' }
      ];
      localStorageMock.setItem('museum_collection', JSON.stringify(collection));

      const result = collectionService.isInCollection('2');

      expect(result).toBe(false);
    });

    test('returns false for empty collection', () => {
      const result = collectionService.isInCollection('1');

      expect(result).toBe(false);
    });
  });
});