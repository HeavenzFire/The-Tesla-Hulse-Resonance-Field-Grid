import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Section from '../components/Section';

describe('Section Component', () => {
  const defaultProps = {
    title: 'Test Section Title',
    subtitle: 'Test Subtitle',
    paragraphs: ['First paragraph', 'Second paragraph'],
  };

  it('should render title correctly', () => {
    render(<Section {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(<Section {...defaultProps} />);
    expect(screen.getByText(defaultProps.subtitle!)).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    render(<Section {...defaultProps} subtitle={undefined} />);
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should render all paragraphs', () => {
    render(<Section {...defaultProps} />);
    defaultProps.paragraphs.forEach(paragraph => {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    });
  });

  it('should display section number when provided', () => {
    render(<Section {...defaultProps} number={5} />);
    expect(screen.getByText('5.')).toBeInTheDocument();
  });

  it('should not display section number when not provided', () => {
    render(<Section {...defaultProps} />);
    expect(screen.queryByText('1.')).not.toBeInTheDocument();
  });

  it('should have proper section structure', () => {
    const { container } = render(<Section {...defaultProps} />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section?.querySelector('h3')).toBeInTheDocument();
    expect(section?.querySelector('h4')).toBeInTheDocument();
  });

  it('should apply bold styling to formatted text in paragraphs', () => {
    const propsWithFormatting = {
      ...defaultProps,
      paragraphs: ['This has **bold** text'],
    };
    render(<Section {...propsWithFormatting} />);
    const strongElement = screen.getByText('bold', { selector: 'strong' });
    expect(strongElement).toBeInTheDocument();
  });

  it('should apply italic styling to formatted text in paragraphs', () => {
    const propsWithFormatting = {
      ...defaultProps,
      paragraphs: ['This has *italic* text'],
    };
    render(<Section {...propsWithFormatting} />);
    const emElement = screen.getByText('italic', { selector: 'em' });
    expect(emElement).toBeInTheDocument();
  });
});
