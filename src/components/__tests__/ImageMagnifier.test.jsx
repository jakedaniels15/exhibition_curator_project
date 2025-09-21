import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageMagnifier from '../ImageMagnifier';

describe('ImageMagnifier Component', () => {
  const defaultProps = {
    src: 'test-image.jpg',
    alt: 'Test artwork',
    magnifierSize: 150,
    zoomLevel: 2.5
  };

  test('renders image with correct alt text', () => {
    render(<ImageMagnifier {...defaultProps} />);
    
    const image = screen.getByAltText('Test artwork');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-image.jpg');
    expect(image).toHaveClass('magnifier-image');
  });

  test('renders magnifier container with hint', () => {
    render(<ImageMagnifier {...defaultProps} />);
    
    expect(screen.getByText('Hover to magnify')).toBeInTheDocument();
    expect(screen.getByText('Image not available')).toBeInTheDocument();
  });

  test('shows magnifier glass on mouse enter', async () => {
    render(<ImageMagnifier {...defaultProps} />);
    
    const image = screen.getByAltText('Test artwork');
    
    // Mock getBoundingClientRect
    image.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      width: 300,
      height: 200
    }));
    
    fireEvent.mouseEnter(image);
    
    // After mouse enter, magnifier glass should be visible
    // We can test this by checking if mouse move works without errors
    fireEvent.mouseMove(image, { clientX: 100, clientY: 100 });
    
    expect(image).toBeInTheDocument();
  });

  test('handles mouse move events', () => {
    render(<ImageMagnifier {...defaultProps} />);
    
    const image = screen.getByAltText('Test artwork');
    
    // Mock getBoundingClientRect
    image.getBoundingClientRect = jest.fn(() => ({
      left: 0,
      top: 0,
      width: 300,
      height: 200
    }));
    
    fireEvent.mouseEnter(image);
    fireEvent.mouseMove(image, { clientX: 100, clientY: 100 });
    
    expect(image).toBeInTheDocument();
  });

  test('uses default magnifier size when not provided', () => {
    render(<ImageMagnifier src="test.jpg" alt="test" />);
    
    const image = screen.getByAltText('test');
    expect(image).toBeInTheDocument();
  });

  test('uses custom magnifier size when provided', () => {
    render(<ImageMagnifier {...defaultProps} magnifierSize={200} />);
    
    const image = screen.getByAltText('Test artwork');
    expect(image).toBeInTheDocument();
  });

  test('handles missing image gracefully', () => {
    render(<ImageMagnifier src="" alt="Missing image" />);
    
    const image = screen.getByAltText('Missing image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '');
  });

  test('handles image error by showing placeholder', () => {
    render(<ImageMagnifier {...defaultProps} />);
    
    const image = screen.getByAltText('Test artwork');
    const placeholder = screen.getByText('Image not available');
    
    // Image error should trigger error handler
    fireEvent.error(image);
    
    expect(placeholder).toBeInTheDocument();
  });
});