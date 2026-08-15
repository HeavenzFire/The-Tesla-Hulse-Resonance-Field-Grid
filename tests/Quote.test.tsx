import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Quote from '../components/Quote';

describe('Quote Component', () => {
  const defaultProps = {
    text: 'This is a test quote',
    author: 'Test Author',
  };

  it('should render quote text correctly', () => {
    render(<Quote {...defaultProps} />);
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toHaveTextContent(defaultProps.text);
  });

  it('should render author correctly', () => {
    render(<Quote {...defaultProps} />);
    expect(screen.getByText(`— ${defaultProps.author}`)).toBeInTheDocument();
  });

  it('should have proper blockquote structure', () => {
    const { container } = render(<Quote {...defaultProps} />);
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
  });

  it('should have cite element for author', () => {
    const { container } = render(<Quote {...defaultProps} />);
    const cite = container.querySelector('cite');
    expect(cite).toBeInTheDocument();
  });

  it('should apply italic class to quote text', () => {
    render(<Quote {...defaultProps} />);
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toHaveClass('italic');
  });

  it('should have centered text alignment', () => {
    const { container } = render(<Quote {...defaultProps} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('text-center');
  });
});
