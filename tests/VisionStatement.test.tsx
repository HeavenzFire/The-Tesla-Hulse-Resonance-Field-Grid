import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VisionStatement from '../components/VisionStatement';

describe('VisionStatement Component', () => {
  const defaultProps = {
    title: 'Test Vision',
    text: [
      'First line of vision',
      '**Second** line with emphasis',
      '*Third* line with italic',
      'Fourth line',
      'Fifth and final line',
    ],
  };

  it('should render title correctly', () => {
    render(<VisionStatement {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('should render all text lines', () => {
    render(<VisionStatement {...defaultProps} />);
    expect(screen.getByText('First line of vision')).toBeInTheDocument();
    expect(screen.getByText('Fourth line')).toBeInTheDocument();
    expect(screen.getByText('Fifth and final line')).toBeInTheDocument();
  });

  it('should display section number 10', () => {
    render(<VisionStatement {...defaultProps} />);
    expect(screen.getByText('10.')).toBeInTheDocument();
  });

  it('should have proper section structure', () => {
    const { container } = render(<VisionStatement {...defaultProps} />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.querySelector('h3')).toBeInTheDocument();
  });

  it('should apply bold styling to formatted text', () => {
    render(<VisionStatement {...defaultProps} />);
    const strongElement = screen.getByText('Second', { selector: 'strong' });
    expect(strongElement).toBeInTheDocument();
  });

  it('should apply italic styling to formatted text', () => {
    render(<VisionStatement {...defaultProps} />);
    const emElement = screen.getByText('Third', { selector: 'em' });
    expect(emElement).toBeInTheDocument();
  });

  it('should have border-top styling', () => {
    const { container } = render(<VisionStatement {...defaultProps} />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('border-t-2');
  });

  it('should have centered text alignment', () => {
    const { container } = render(<VisionStatement {...defaultProps} />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('text-center');
  });
});
