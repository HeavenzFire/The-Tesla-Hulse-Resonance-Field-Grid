import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { MANIFESTO_SECTIONS, QUOTE, IMPLEMENTATION_PATHWAYS, VISION_STATEMENT } from '../constants';

describe('App Component', () => {
  it('renders the main title correctly', () => {
    render(<App />);
    expect(screen.getByText('The Tesla–Hulse Resonance Field Grid')).toBeInTheDocument();
  });

  it('renders the subtitle correctly', () => {
    render(<App />);
    expect(
      screen.getByText('A Unified Framework for Omnipresent Energy and Conscious Syntropy')
    ).toBeInTheDocument();
  });

  it('renders the Abstract section', () => {
    render(<App />);
    expect(screen.getByText('Abstract')).toBeInTheDocument();
    expect(
      screen.getByText(/Humanity stands at the threshold of a new energetic epoch/i)
    ).toBeInTheDocument();
  });

  it('renders all manifesto sections', () => {
    render(<App />);
    MANIFESTO_SECTIONS.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
      if (section.subtitle) {
        expect(screen.getByText(section.subtitle)).toBeInTheDocument();
      }
    });
  });

  it('renders the quote section', () => {
    render(<App />);
    // Check for key parts of the quote since it contains formatted text
    expect(screen.getByText(/Syntropy is not the opposite of entropy/i)).toBeInTheDocument();
    // Author is rendered with "— " prefix, use getAllBy since it might match multiple elements
    const authorElements = screen.getAllByText(/Zachary Dakota Hulse/);
    expect(authorElements.length).toBeGreaterThan(0);
  });

  it('renders the Implementation Pathways section', () => {
    render(<App />);
    expect(screen.getByText('Implementation Pathways')).toBeInTheDocument();
    // Check for key phrases from each pathway (text is split due to formatting)
    expect(screen.getByText('Mapping')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Calibration')).toBeInTheDocument();
    expect(screen.getByText('Distribution')).toBeInTheDocument();
    expect(screen.getByText('Conscious Synchronization')).toBeInTheDocument();
  });

  it('renders the Vision Statement section', () => {
    render(<App />);
    expect(screen.getByText('Vision Statement')).toBeInTheDocument();
    // Check for key phrases from the vision statement instead of exact text match
    expect(screen.getByText(/When humanity ceases to conquer energy/i)).toBeInTheDocument();
    expect(screen.getByText(/Resonant Civilization/i)).toBeInTheDocument();
  });

  it('has proper semantic structure with main element', () => {
    const { container } = render(<App />);
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('max-w-4xl', 'mx-auto', 'px-6');
  });

  it('applies dark theme styling to root container', () => {
    const { container } = render(<App />);
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv).toHaveClass('bg-gray-900', 'text-gray-300', 'min-h-screen');
  });

  it('renders correct number of Section components', () => {
    render(<App />);
    // Abstract + all manifesto sections (7 sections) + Implementation Pathways + Vision Statement
    const expectedSectionCount = 1 + MANIFESTO_SECTIONS.length + 2;
    // Count section elements by their semantic structure
    const sections = screen.getAllByTestId('section-component');
    expect(sections).toHaveLength(expectedSectionCount);
  });

  it('maintains proper content hierarchy', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(5);
    
    // First heading should be the main title (h1)
    expect(headings[0]).toHaveTextContent('The Tesla–Hulse Resonance Field Grid');
  });
});
