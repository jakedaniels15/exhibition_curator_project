import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  test('renders search input and button', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText(/search artworks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search artworks by title, artist, or keyword/i)).toBeInTheDocument();
  });

  test('calls onSearch when form is submitted with valid input', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search artworks/i);
    const form = screen.getByRole('search');
    
    await user.type(input, 'Van Gogh');
    fireEvent.submit(form);
    
    expect(mockOnSearch).toHaveBeenCalledWith('Van Gogh');
  });

  test('does not call onSearch when form is submitted with empty input', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const form = screen.getByRole('search');
    
    fireEvent.submit(form);
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('trims whitespace from search term', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search artworks/i);
    const form = screen.getByRole('search');
    
    await user.type(input, '  Monet  ');
    fireEvent.submit(form);
    
    expect(mockOnSearch).toHaveBeenCalledWith('Monet');
  });

  test('updates input value when initialValue prop changes', () => {
    const { rerender } = render(<SearchBar onSearch={mockOnSearch} initialValue="Initial" />);
    
    expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();
    
    rerender(<SearchBar onSearch={mockOnSearch} initialValue="Updated" />);
    
    expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
  });

  test('disables button when loading', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
    
    const button = screen.getByRole('button', { name: /searching/i });
    expect(button).toBeDisabled();
  });

  test('allows form submission with Enter key', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search artworks/i);
    
    await user.type(input, 'Picasso{enter}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('Picasso');
  });
});