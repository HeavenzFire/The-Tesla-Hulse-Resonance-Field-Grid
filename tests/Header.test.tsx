import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';

describe('Header Component', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
  };

  it('should render title correctly', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('should render subtitle correctly', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument();
  });

  it('should have proper header structure', () => {
    const { container } = render(<Header {...defaultProps} />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header?.querySelector('h1')).toBeInTheDocument();
    expect(header?.querySelector('h2')).toBeInTheDocument();
  });

  it('should apply gradient text class to title', () => {
    render(<Header {...defaultProps} />);
    const title = screen.getByText(defaultProps.title);
    expect(title).toHaveClass('bg-gradient-to-r');
  });

  it('should have border-bottom styling', () => {
    const { container } = render(<Header {...defaultProps} />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('border-b-2');
  });
});
