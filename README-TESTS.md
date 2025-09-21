# Testing Setup for Museum Project

## Overview
This project now includes comprehensive Jest testing setup with React Testing Library for component testing and service testing.

## Test Configuration

### Dependencies Installed
- `jest` - Testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM assertions
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - Browser-like environment for Jest
- `babel-jest` - Babel transformation for Jest
- `@babel/preset-env` & `@babel/preset-react` - Babel presets for ES6+ and React
- `identity-obj-proxy` - CSS module mocking

### Test Files Created
- `src/setupTests.js` - Global test setup and mocks
- `src/components/__tests__/SearchBar.test.jsx` - SearchBar component tests
- `src/components/__tests__/ImageMagnifier.test.jsx` - ImageMagnifier component tests  
- `src/services/__tests__/metApi.test.js` - Met Museum API service tests
- `src/services/__tests__/collectionService.test.js` - Collection service tests

### Available Scripts
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Test Features

### Component Testing
- **SearchBar**: Tests form submission, input validation, loading states, keyboard navigation
- **ImageMagnifier**: Tests hover interactions, image display, responsive behavior

### Service Testing
- **metApi**: Tests API calls, error handling, data transformation with mocked fetch
- **collectionService**: Tests localStorage operations, CRUD operations with mocked localStorage

### Global Mocks & Setup
- `localStorage` mocking for collection service tests
- `fetch` mocking for API service tests
- `matchMedia` mocking for responsive design tests
- `IntersectionObserver` mocking for modern browser APIs

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test SearchBar

# Run tests matching a pattern
npm test -- --testNamePattern="handles API errors"
```

## Test Structure

Tests follow the Arrange-Act-Assert pattern:
1. **Arrange**: Set up component/service with required props/mocks
2. **Act**: Interact with component or call service method
3. **Assert**: Verify expected behavior occurred

Example:
```javascript
test('calls onSearch when form is submitted with valid input', async () => {
  // Arrange
  const user = userEvent.setup();
  const mockOnSearch = jest.fn();
  render(<SearchBar onSearch={mockOnSearch} />);
  
  // Act
  const input = screen.getByPlaceholderText(/search artworks/i);
  await user.type(input, 'Van Gogh');
  fireEvent.submit(screen.getByRole('search'));
  
  // Assert
  expect(mockOnSearch).toHaveBeenCalledWith('Van Gogh');
});
```

## Coverage Goals
- Components: Focus on user interactions and prop handling
- Services: Focus on API calls, error states, and data transformations
- Critical paths: Search functionality, collection management, error handling

## Next Steps
1. Add integration tests for complete user workflows
2. Add snapshot testing for UI consistency
3. Add performance testing for search and collection operations
4. Add accessibility testing with @testing-library/jest-dom matchers