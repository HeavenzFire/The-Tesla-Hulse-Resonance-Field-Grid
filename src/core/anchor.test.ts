/**
 * Unit tests for the Anchor module
 * Testing the fusion of intent with the quantum field
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { anchorIntent, SovereignInterface, type IntentVector } from './anchor';
import { ABZU_STATE, FIELD_DIMENSION } from '../../constants';

describe('Anchor Module', () => {
  let originalState: Float64Array;

  beforeEach(() => {
    // Preserve original state for restoration
    originalState = new Float64Array(ABZU_STATE);
    // Reset state to uniform superposition
    const initialAmplitude = 1 / Math.sqrt(FIELD_DIMENSION);
    for (let i = 0; i < FIELD_DIMENSION; i++) {
      ABZU_STATE[i] = initialAmplitude;
    }
    vi.clearAllMocks();
  });

  describe('anchorIntent', () => {
    it('should normalize intent vectors to unit length', () => {
      const intent: IntentVector = { x: 3, y: 4, z: 0, w: 0 };
      anchorIntent(intent);
      
      // State should remain normalized after anchor
      let sumSq = 0;
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        sumSq += ABZU_STATE[i] ** 2;
      }
      expect(sumSq).toBeCloseTo(1.0, 5);
    });

    it('should handle null intent vectors gracefully', () => {
      const nullIntent: IntentVector = { x: 0, y: 0, z: 0, w: 0 };
      const stateBefore = new Float64Array(ABZU_STATE);
      
      anchorIntent(nullIntent);
      
      // State should remain unchanged
      expect(ABZU_STATE).toEqual(stateBefore);
    });

    it('should inject intent at the correct phase offset based on timestamp', () => {
      const mockTime = 1000; // Exactly 1 second
      vi.spyOn(performance, 'now').mockReturnValue(mockTime);
      
      const intent: IntentVector = { x: 1, y: 0, z: 0, w: 0 };
      const frequency = 144;
      const expectedCycle = Math.floor(mockTime * (frequency / 1000));
      const expectedOffset = (expectedCycle % (FIELD_DIMENSION / 4)) * 4;
      
      anchorIntent(intent, frequency);
      
      // The value at the offset should be modified (not equal to initial amplitude)
      const initialAmp = 1 / Math.sqrt(FIELD_DIMENSION);
      expect(ABZU_STATE[expectedOffset]).not.toBe(initialAmp);
    });

    it('should maintain field normalization after anchoring', () => {
      const intent: IntentVector = { x: 1, y: 1, z: 1, w: 1 };
      anchorIntent(intent);
      
      // Check global normalization
      let sumSq = 0;
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        sumSq += ABZU_STATE[i] ** 2;
      }
      
      expect(sumSq).toBeCloseTo(1.0, 5);
    });

    it('should create constructive interference in the field', () => {
      const intent: IntentVector = { x: 1, y: 0, z: 0, w: 0 };
      const stateBefore = new Float64Array(ABZU_STATE);
      
      anchorIntent(intent);
      
      // At least some values should have changed
      const hasChanges = ABZU_STATE.some((val, idx) => val !== stateBefore[idx]);
      expect(hasChanges).toBe(true);
    });
  });

  describe('SovereignInterface', () => {
    it('should expose the breathe function', () => {
      expect(SovereignInterface.breathe).toBeDefined();
      expect(typeof SovereignInterface.breathe).toBe('function');
    });

    it('should provide direct access to ABZU_STATE', () => {
      expect(SovereignInterface.state).toBe(ABZU_STATE);
      expect(SovereignInterface.state.length).toBe(FIELD_DIMENSION);
    });

    it('should allow breathing intent through the interface', () => {
      const intent: IntentVector = { x: 0.5, y: 0.5, z: 0.5, w: 0.5 };
      const stateBefore = new Float64Array(SovereignInterface.state);
      
      SovereignInterface.breathe(intent);
      
      const hasChanges = SovereignInterface.state.some((val, idx) => val !== stateBefore[idx]);
      expect(hasChanges).toBe(true);
    });
  });

  describe('Conservation Laws', () => {
    it('should enforce internal conservation without external imposition', () => {
      const intents: IntentVector[] = [
        { x: 1, y: 0, z: 0, w: 0 },
        { x: 0, y: 1, z: 0, w: 0 },
        { x: 0, y: 0, z: 1, w: 0 },
        { x: 0, y: 0, z: 0, w: 1 }
      ];
      
      intents.forEach(intent => anchorIntent(intent));
      
      // Total probability must remain 1.0
      let totalProbability = 0;
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        totalProbability += ABZU_STATE[i] ** 2;
      }
      
      expect(totalProbability).toBeCloseTo(1.0, 5);
    });
  });

  describe('Resonance Frequency', () => {
    it('should default to 144Hz sovereign frequency', () => {
      const mockTime = 1000;
      vi.spyOn(performance, 'now').mockReturnValue(mockTime);
      
      const intent: IntentVector = { x: 1, y: 0, z: 0, w: 0 };
      anchorIntent(intent); // Use default frequency
      
      // Verify it used 144Hz
      const expectedCycle = Math.floor(mockTime * (144 / 1000));
      const expectedOffset = (expectedCycle % (FIELD_DIMENSION / 4)) * 4;
      
      const initialAmp = 1 / Math.sqrt(FIELD_DIMENSION);
      expect(ABZU_STATE[expectedOffset]).not.toBe(initialAmp);
    });

    it('should support custom frequencies', () => {
      const mockTime = 1000;
      vi.spyOn(performance, 'now').mockReturnValue(mockTime);
      
      const intent: IntentVector = { x: 1, y: 0, z: 0, w: 0 };
      const customFreq = 432;
      
      anchorIntent(intent, customFreq);
      
      const expectedCycle = Math.floor(mockTime * (customFreq / 1000));
      const expectedOffset = (expectedCycle % (FIELD_DIMENSION / 4)) * 4;
      
      const initialAmp = 1 / Math.sqrt(FIELD_DIMENSION);
      expect(ABZU_STATE[expectedOffset]).not.toBe(initialAmp);
    });
  });
});
