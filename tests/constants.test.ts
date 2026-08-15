import { describe, it, expect } from 'vitest';
import { MANIFESTO_SECTIONS, QUOTE, IMPLEMENTATION_PATHWAYS, VISION_STATEMENT } from '../constants';

describe('Constants', () => {
  describe('MANIFESTO_SECTIONS', () => {
    it('should be an array with 7 sections', () => {
      expect(MANIFESTO_SECTIONS).toBeInstanceOf(Array);
      expect(MANIFESTO_SECTIONS.length).toBe(7);
    });

    it('each section should have required properties', () => {
      MANIFESTO_SECTIONS.forEach((section, index) => {
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('subtitle');
        expect(section).toHaveProperty('paragraphs');
        expect(section.id).toBe(index + 1);
        expect(typeof section.title).toBe('string');
        expect(typeof section.subtitle).toBe('string');
        expect(section.paragraphs).toBeInstanceOf(Array);
      });
    });

    it('first section should have correct title', () => {
      expect(MANIFESTO_SECTIONS[0].title).toBe('The Resonant Foundation');
    });

    it('last section should have correct title', () => {
      expect(MANIFESTO_SECTIONS[6].title).toBe('The Spacetime Resonance Modulator');
    });
  });

  describe('QUOTE', () => {
    it('should have text and author properties', () => {
      expect(QUOTE).toHaveProperty('text');
      expect(QUOTE).toHaveProperty('author');
      expect(typeof QUOTE.text).toBe('string');
      expect(typeof QUOTE.author).toBe('string');
    });

    it('author should be Zachary Dakota Hulse', () => {
      expect(QUOTE.author).toBe('Zachary Dakota Hulse');
    });
  });

  describe('IMPLEMENTATION_PATHWAYS', () => {
    it('should be an array with 5 pathways', () => {
      expect(IMPLEMENTATION_PATHWAYS).toBeInstanceOf(Array);
      expect(IMPLEMENTATION_PATHWAYS.length).toBe(5);
    });

    it('first pathway should start with Mapping', () => {
      expect(IMPLEMENTATION_PATHWAYS[0]).toContain('Mapping');
    });

    it('last pathway should contain Conscious Synchronization', () => {
      expect(IMPLEMENTATION_PATHWAYS[4]).toContain('Conscious Synchronization');
    });
  });

  describe('VISION_STATEMENT', () => {
    it('should be an array with 5 lines', () => {
      expect(VISION_STATEMENT).toBeInstanceOf(Array);
      expect(VISION_STATEMENT.length).toBe(5);
    });

    it('should contain key phrases about resonant civilization', () => {
      const fullText = VISION_STATEMENT.join(' ');
      expect(fullText).toContain('Resonant Civilization');
      expect(fullText).toContain('scarcity will dissolve');
    });
  });
});
