import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImplementationPathways from '../components/ImplementationPathways';

describe('ImplementationPathways Component', () => {
  const defaultProps = {
    title: 'Test Pathways',
    pathways: [
      '**First** pathway description',
      '*Second* pathway description',
      'Third pathway description',
    ],
  };

  it('should render title correctly', () => {
    render(<ImplementationPathways {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('should render all pathways', () => {
    render(<ImplementationPathways {...defaultProps} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third pathway description')).toBeInTheDocument();
  });

  it('should display section number 9', () => {
    render(<ImplementationPathways {...defaultProps} />);
    expect(screen.getByText('9.')).toBeInTheDocument();
  });

  it('should have ordered list structure', () => {
    const { container } = render(<ImplementationPathways {...defaultProps} />);
    const ol = container.querySelector('ol');
    expect(ol).toBeInTheDocument();
  });

  it('should apply bold styling to formatted text', () => {
    render(<ImplementationPathways {...defaultProps} />);
    const strongElement = screen.getByText('First', { selector: 'strong' });
    expect(strongElement).toBeInTheDocument();
  });

  it('should apply italic styling to formatted text', () => {
    render(<ImplementationPathways {...defaultProps} />);
    const emElement = screen.getByText('Second', { selector: 'em' });
    expect(emElement).toBeInTheDocument();
  });

  it('should have proper list styling classes', () => {
    const { container } = render(<ImplementationPathways {...defaultProps} />);
    const ol = container.querySelector('ol');
    expect(ol).toHaveClass('list-decimal');
    expect(ol).toHaveClass('list-inside');
  });
});
