import { searchArtworksMet, getArtworkDetailsMet } from '../metApi';

// Mock fetch globally
global.fetch = jest.fn();

describe('Met API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Silence console output during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('searchArtworksMet', () => {
    test('successfully searches for artworks', async () => {
      const mockSearchResponse = {
        objectIDs: [123, 456, 789]
      };

      const mockArtworkDetail = {
        objectID: 123,
        title: 'Test Artwork',
        artistDisplayName: 'Test Artist',
        objectDate: '2023',
        primaryImageSmall: 'https://example.com/image.jpg',
        primaryImage: 'https://example.com/large-image.jpg'
      };

      // Mock the search request
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSearchResponse)
        })
        // Mock the detail requests
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockArtworkDetail)
        });

      const results = await searchArtworksMet('Van Gogh');

      expect(fetch).toHaveBeenCalledWith(
        'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=Van%20Gogh'
      );
      expect(results).toHaveLength(3);
    });

    test('handles search API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const results = await searchArtworksMet('Van Gogh');

      expect(results).toEqual([]);
    });

    test('handles empty search results', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ objectIDs: [] })
      });

      const results = await searchArtworksMet('NonexistentArtist');

      expect(results).toEqual([]);
    });

    test('limits results to specified limit', async () => {
      const mockSearchResponse = {
        objectIDs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      };

      const mockArtworkDetail = {
        objectID: 1,
        title: 'Test Artwork',
        artistDisplayName: 'Test Artist',
        objectDate: '2023',
        primaryImageSmall: 'https://example.com/image.jpg'
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSearchResponse)
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockArtworkDetail)
        });

      const results = await searchArtworksMet('test', 3);

      // Should only fetch details for first 3 objects
      expect(fetch).toHaveBeenCalledTimes(4); // 1 search + 3 detail calls
    });

    test('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const results = await searchArtworksMet('Van Gogh');

      expect(results).toEqual([]);
    });
  });

  describe('getArtworkDetailsMet', () => {
    test('successfully gets artwork details', async () => {
      const mockDetailResponse = {
        objectID: 123,
        title: 'Starry Night',
        artistDisplayName: 'Vincent van Gogh',
        objectDate: '1889',
        objectBeginDate: 1889,
        primaryImageSmall: 'https://example.com/starry-night.jpg',
        primaryImage: 'https://example.com/starry-night-large.jpg',
        medium: 'Oil on canvas',
        dimensions: '73.7 cm × 92.1 cm',
        classification: 'Paintings'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDetailResponse)
      });

      const result = await getArtworkDetailsMet('met-123');

      expect(fetch).toHaveBeenCalledWith(
        'https://collectionapi.metmuseum.org/public/collection/v1/objects/123'
      );
      expect(result).toMatchObject({
        id: 'met-123',
        title: 'Starry Night',
        artist: 'Vincent van Gogh',
        date: '1889',
        imageUrl: 'https://example.com/starry-night-large.jpg'
      });
    });

    test('handles invalid artwork IDs', async () => {
      const result = await getArtworkDetailsMet('invalid-id');
      
      // The function will still try to fetch, but let's mock a not found response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result2 = await getArtworkDetailsMet('met-999');
      expect(result2).toBeNull();
    });

    test('handles API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await getArtworkDetailsMet('met-999');
      expect(result).toBeNull();
    });

    test('returns null for artworks without images', async () => {
      const mockDetailResponse = {
        objectID: 123,
        title: 'Artwork Without Image',
        artistDisplayName: 'Test Artist',
        objectDate: '2023',
        // No primaryImage or primaryImageSmall
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDetailResponse)
      });

      const result = await getArtworkDetailsMet('met-123');
      expect(result).toBeNull();
    });

    test('handles missing date gracefully', async () => {
      const mockDetailResponse = {
        objectID: 123,
        title: 'Test Artwork',
        artistDisplayName: 'Test Artist',
        // No objectDate or objectBeginDate
        primaryImageSmall: 'https://example.com/image.jpg'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDetailResponse)
      });

      const result = await getArtworkDetailsMet('met-123');
      expect(result.date).toBe('Date unknown');
    });
  });
});