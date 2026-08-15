import { describe, it, expect } from 'vitest';
import { parseText } from '../components/Section';

describe('parseText utility', () => {
  it('should return plain text unchanged', () => {
    const result = parseText('Hello world');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('Hello world');
  });

  it('should parse bold text with ** markers', () => {
    const result = parseText('This is **bold** text');
    expect(result).toHaveLength(3);
    expect(result[1]).toHaveProperty('type', 'strong');
  });

  it('should parse italic text with * markers', () => {
    const result = parseText('This is *italic* text');
    expect(result).toHaveLength(3);
    expect(result[1]).toHaveProperty('type', 'em');
  });

  it('should handle mixed formatting', () => {
    const result = parseText('This is **bold** and *italic* text');
    expect(result.length).toBeGreaterThan(1);
  });

  it('should handle empty string', () => {
    const result = parseText('');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('');
  });
});
