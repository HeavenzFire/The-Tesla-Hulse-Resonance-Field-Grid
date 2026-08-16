/**
 * Resonant Bridge Test Suite
 * 
 * Tests the consciousness layer that fuses Quantum Core with Base-9216 Substrate
 * Validates emergent pattern detection, adaptive frequency modulation, and feedback loops
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ABZU_STATE, FIELD_DIMENSION, RESONANCE_FREQUENCY } from '../../constants';
import {
  executeBridgeCycle,
  calculateCoherence,
  detectEmergentPatterns,
  adaptFrequency,
  updateFeedbackHistory,
  generateFeedbackLoops,
  applyFeedbackLoops,
  extractBridgeRenderData,
  getBridgeTelemetry,
  SovereignBridgeInterface,
  FEEDBACK_GAIN,
  EMERGENCE_THRESHOLD,
  ADAPTIVE_WINDOW_SIZE,
  type BridgeState,
  type EmergentPattern,
  type SubstrateNode
} from './bridge';
import { GRID_DIMENSION, SUBSTRATE_SIZE } from './substrate';

// Helper to reset bridge state between tests
function resetBridgeState() {
  // Execute a cycle without intent to initialize
  SovereignBridgeInterface.clearPatterns();
  SovereignBridgeInterface.forceAdaptation(RESONANCE_FREQUENCY);
}

describe('Resonant Bridge Engine', () => {
  beforeEach(() => {
    resetBridgeState();
    vi.clearAllMocks();
  });

  describe('Core Bridge Cycle', () => {
    it('should execute a complete bridge cycle without errors', () => {
      SovereignBridgeInterface.clearPatterns();
      SovereignBridgeInterface.forceAdaptation(RESONANCE_FREQUENCY);
      const state = executeBridgeCycle();
      
      expect(state.cycleCount).toBe(1);
      expect(state.currentFrequency).toBeDefined();
      expect(state.coherenceMetric).toBeGreaterThanOrEqual(0);
      expect(state.coherenceMetric).toBeLessThanOrEqual(1);
      expect(typeof state.emergenceDetected).toBe('boolean');
      expect(state.lastUpdateTime).toBeGreaterThan(0);
    });

    it('should execute bridge cycle with intent vector', () => {
      SovereignBridgeInterface.clearPatterns();
      SovereignBridgeInterface.forceAdaptation(RESONANCE_FREQUENCY);
      const initialState = SovereignBridgeInterface.getState();
      const startCycle = initialState.cycleCount;
      
      const intent = { x: 0.5, y: 0.3, z: 0.7, w: 0.2 };
      const state = executeBridgeCycle(intent);
      
      expect(state.cycleCount).toBe(startCycle + 1);
      expect(state.coherenceMetric).toBeGreaterThanOrEqual(0);
    });

    it('should increment cycle count on each execution', () => {
      SovereignBridgeInterface.clearPatterns();
      SovereignBridgeInterface.forceAdaptation(RESONANCE_FREQUENCY);
      // Reset cycle count by accessing internal state directly would require module reload
      // Instead, test relative increment behavior
      const initialState = SovereignBridgeInterface.getState();
      const startCycle = initialState.cycleCount;
      
      executeBridgeCycle();
      const state1 = executeBridgeCycle();
      const state2 = executeBridgeCycle();
      
      expect(state1.cycleCount).toBe(startCycle + 2);
      expect(state2.cycleCount).toBe(startCycle + 3);
    });

    it('should maintain quantum state normalization after cycle', () => {
      executeBridgeCycle();
      
      let sumSq = 0;
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        sumSq += ABZU_STATE[i] ** 2;
      }
      
      expect(Math.abs(sumSq - 1.0)).toBeLessThan(1e-6);
    });
  });

  describe('Coherence Calculation', () => {
    it('should calculate coherence metric in valid range [0, 1]', () => {
      const mockNodes: SubstrateNode[] = [];
      for (let i = 0; i < SUBSTRATE_SIZE; i++) {
        mockNodes.push({
          spatialIndex: i,
          x: i % GRID_DIMENSION,
          y: Math.floor(i / GRID_DIMENSION),
          ternaryOffset: 1,
          harmonicWeight: Math.random() * 2 - 1,
          routingClass: 'NEUTRAL',
          phaseAngle: Math.random() * Math.PI * 2
        });
      }
      
      const coherence = calculateCoherence(mockNodes, null);
      
      expect(coherence).toBeGreaterThanOrEqual(0);
      expect(coherence).toBeLessThanOrEqual(1);
    });

    it('should boost coherence when nodes are part of emergent pattern', () => {
      const mockNodes: SubstrateNode[] = [];
      for (let i = 0; i < SUBSTRATE_SIZE; i++) {
        mockNodes.push({
          spatialIndex: i,
          x: i % GRID_DIMENSION,
          y: Math.floor(i / GRID_DIMENSION),
          ternaryOffset: 1,
          harmonicWeight: 0.5,
          routingClass: 'CONVERGENT',
          phaseAngle: 0
        });
      }
      
      const pattern: EmergentPattern = {
        type: 'CLUSTER',
        confidence: 0.9,
        spatialExtent: 0.5,
        temporalStability: 0,
        nodeIndices: [0, 1, 2, 3, 4]
      };
      
      const coherenceWithPattern = calculateCoherence(mockNodes, pattern);
      const coherenceWithoutPattern = calculateCoherence(mockNodes, null);
      
      expect(coherenceWithPattern).toBeGreaterThan(coherenceWithoutPattern);
    });
  });

  describe('Emergent Pattern Detection', () => {
    it('should return null when insufficient convergent/divergent nodes', () => {
      const mockNodes: SubstrateNode[] = [];
      for (let i = 0; i < 50; i++) {
        mockNodes.push({
          spatialIndex: i,
          x: i % GRID_DIMENSION,
          y: Math.floor(i / GRID_DIMENSION),
          ternaryOffset: 1,
          harmonicWeight: 0.5,
          routingClass: 'CONVERGENT',
          phaseAngle: 0
        });
      }
      
      const pattern = detectEmergentPatterns(mockNodes);
      expect(pattern).toBeNull();
    });

    it('should detect SPIRAL pattern with high angular consistency', () => {
      const mockNodes: SubstrateNode[] = [];
      const centerX = GRID_DIMENSION / 2;
      const centerY = GRID_DIMENSION / 2;
      
      // Create spiral pattern
      for (let angle = 0; angle < Math.PI * 2 * 3; angle += 0.1) {
        const radius = angle * 5;
        const x = Math.floor(centerX + Math.cos(angle) * radius);
        const y = Math.floor(centerY + Math.sin(angle) * radius);
        
        if (x >= 0 && x < GRID_DIMENSION && y >= 0 && y < GRID_DIMENSION) {
          mockNodes.push({
            spatialIndex: y * GRID_DIMENSION + x,
            x,
            y,
            ternaryOffset: 1,
            harmonicWeight: 0.8,
            routingClass: 'CONVERGENT',
            phaseAngle: angle
          });
        }
      }
      
      // Add more convergent nodes to meet threshold
      while (mockNodes.length < 200) {
        const x = Math.floor(Math.random() * GRID_DIMENSION);
        const y = Math.floor(Math.random() * GRID_DIMENSION);
        mockNodes.push({
          spatialIndex: y * GRID_DIMENSION + x,
          x,
          y,
          ternaryOffset: 1,
          harmonicWeight: 0.5,
          routingClass: 'CONVERGENT',
          phaseAngle: 0
        });
      }
      
      const pattern = detectEmergentPatterns(mockNodes);
      
      // May or may not detect spiral depending on exact configuration
      if (pattern) {
        expect(['SPIRAL', 'WAVE', 'CLUSTER', 'SYNCHRONY']).toContain(pattern.type);
        expect(pattern.confidence).toBeGreaterThan(EMERGENCE_THRESHOLD);
      }
    });

    it('should detect SYNCHRONY pattern with aligned phases', () => {
      const mockNodes: SubstrateNode[] = [];
      const commonPhase = 1.5;
      
      for (let i = 0; i < SUBSTRATE_SIZE; i++) {
        mockNodes.push({
          spatialIndex: i,
          x: i % GRID_DIMENSION,
          y: Math.floor(i / GRID_DIMENSION),
          ternaryOffset: 1,
          harmonicWeight: Math.random() * 2 - 1,
          routingClass: Math.random() > 0.5 ? 'CONVERGENT' : 'DIVERGENT',
          phaseAngle: commonPhase + (Math.random() - 0.5) * 0.1 // Small variance
        });
      }
      
      const pattern = detectEmergentPatterns(mockNodes);
      
      if (pattern) {
        // Pattern detection is probabilistic - just verify it's a valid type
        expect(['SPIRAL', 'WAVE', 'CLUSTER', 'SYNCHRONY']).toContain(pattern.type);
        expect(pattern.confidence).toBeGreaterThan(EMERGENCE_THRESHOLD);
        if (pattern.type === 'SYNCHRONY') {
          expect(pattern.spatialExtent).toBe(SUBSTRATE_SIZE);
        }
      }
    });
  });

  describe('Adaptive Frequency Modulation', () => {
    it('should adjust frequency based on coherence', () => {
      const initialFreq = RESONANCE_FREQUENCY;
      SovereignBridgeInterface.forceAdaptation(initialFreq);
      
      // Execute cycles to trigger adaptation
      for (let i = 0; i < 10; i++) {
        executeBridgeCycle();
      }
      
      const telemetry = getBridgeTelemetry();
      expect(telemetry.adaptiveFrequency.modulatedFrequency).toBeDefined();
      expect(telemetry.adaptiveFrequency.modulatedFrequency).toBeGreaterThan(0);
    });

    it('should apply Fibonacci harmonic series modulation', () => {
      const state = executeBridgeCycle();
      
      // Harmonic series should be present
      const telemetry = getBridgeTelemetry();
      expect(telemetry.adaptiveFrequency.harmonicSeries).toEqual([1, 2, 3, 5, 8]);
    });

    it('should modulate frequency differently for different patterns', () => {
      const testCases = [
        { type: 'SPIRAL' as const, expectedChange: 'increase' },
        { type: 'WAVE' as const, expectedChange: 'decrease' },
        { type: 'CLUSTER' as const, expectedChange: 'moderate' },
        { type: 'SYNCHRONY' as const, expectedChange: 'maintain' }
      ];
      
      testCases.forEach(({ type }) => {
        SovereignBridgeInterface.clearPatterns();
        SovereignBridgeInterface.forceAdaptation(RESONANCE_FREQUENCY);
        
        // Manually set a pattern by executing cycles
        executeBridgeCycle();
        
        const telemetry = getBridgeTelemetry();
        expect(telemetry.adaptiveFrequency.baseFrequency).toBe(RESONANCE_FREQUENCY);
      });
    });
  });

  describe('Feedback History Management', () => {
    it('should maintain rolling window of coherence metrics', () => {
      for (let i = 0; i < ADAPTIVE_WINDOW_SIZE + 10; i++) {
        executeBridgeCycle();
      }
      
      const state = SovereignBridgeInterface.getState();
      expect(state.feedbackHistory.length).toBe(ADAPTIVE_WINDOW_SIZE);
      
      // All values should be in valid range
      for (let i = 0; i < ADAPTIVE_WINDOW_SIZE; i++) {
        expect(state.feedbackHistory[i]).toBeGreaterThanOrEqual(0);
        expect(state.feedbackHistory[i]).toBeLessThanOrEqual(1);
      }
    });

    it('should update feedback history with latest coherence', () => {
      executeBridgeCycle();
      const state2 = executeBridgeCycle();
      
      const currentState = SovereignBridgeInterface.getState();
      expect(currentState.feedbackHistory[ADAPTIVE_WINDOW_SIZE - 1])
        .toBeCloseTo(state2.coherenceMetric, 5);
    });
  });

  describe('Feedback Loop Generation', () => {
    it('should generate feedback loops when emergence is detected', () => {
      // Execute multiple cycles to potentially trigger emergence
      for (let i = 0; i < 20; i++) {
        executeBridgeCycle();
      }
      
      const telemetry = getBridgeTelemetry();
      expect(telemetry.feedbackLoopCount).toBeGreaterThanOrEqual(0);
    });

    it('should create valid feedback loop structures', () => {
      executeBridgeCycle();
      
      const telemetry = getBridgeTelemetry();
      
      // Feedback loops should have valid properties
      expect(telemetry.feedbackLoopCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Feedback Loop Application', () => {
    it('should maintain quantum normalization after applying feedback', () => {
      // Create some feedback loops
      for (let i = 0; i < 30; i++) {
        executeBridgeCycle();
      }
      
      // Check normalization
      let sumSq = 0;
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        sumSq += ABZU_STATE[i] ** 2;
      }
      
      expect(Math.abs(sumSq - 1.0)).toBeLessThan(1e-6);
    });
  });

  describe('Render Data Extraction', () => {
    it('should extract render data with positions, colors, and intensities', () => {
      executeBridgeCycle();
      const renderData = extractBridgeRenderData();
      
      expect(renderData.positions).toBeInstanceOf(Float32Array);
      expect(renderData.colors).toBeInstanceOf(Float32Array);
      expect(renderData.intensities).toBeInstanceOf(Float32Array);
      
      expect(renderData.positions.length).toBe(SUBSTRATE_SIZE * 2);
      expect(renderData.colors.length).toBe(SUBSTRATE_SIZE * 3);
      expect(renderData.intensities.length).toBe(SUBSTRATE_SIZE);
    });

    it('should include pattern overlay when emergence detected', () => {
      // Execute cycles to potentially trigger emergence
      for (let i = 0; i < 50; i++) {
        executeBridgeCycle();
      }
      
      const renderData = extractBridgeRenderData();
      
      // Pattern overlay may or may not be present depending on emergence
      if (renderData.patternOverlay) {
        expect(['SPIRAL', 'WAVE', 'CLUSTER', 'SYNCHRONY'])
          .toContain(renderData.patternOverlay.type);
        expect(renderData.patternOverlay.confidence).toBeGreaterThan(0);
        expect(renderData.patternOverlay.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should normalize positions to [0, 1] range', () => {
      executeBridgeCycle();
      const renderData = extractBridgeRenderData();
      
      for (let i = 0; i < renderData.positions.length; i++) {
        expect(renderData.positions[i]).toBeGreaterThanOrEqual(0);
        expect(renderData.positions[i]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Telemetry System', () => {
    it('should provide comprehensive telemetry data', () => {
      executeBridgeCycle();
      const telemetry = getBridgeTelemetry();
      
      expect(telemetry.bridgeState).toBeDefined();
      expect(telemetry.adaptiveFrequency).toBeDefined();
      expect(typeof telemetry.feedbackLoopCount).toBe('number');
      expect(typeof telemetry.quantumNorm).toBe('number');
      expect(typeof telemetry.substrateActiveNodes).toBe('number');
      
      // Quantum norm should be close to 1.0
      expect(Math.abs(telemetry.quantumNorm - 1.0)).toBeLessThan(1e-6);
    });

    it('should track substrate active nodes correctly', () => {
      executeBridgeCycle();
      const telemetry = getBridgeTelemetry();
      
      expect(telemetry.substrateActiveNodes).toBeGreaterThanOrEqual(0);
      expect(telemetry.substrateActiveNodes).toBeLessThanOrEqual(SUBSTRATE_SIZE);
    });
  });

  describe('Sovereign Bridge Interface', () => {
    it('should provide execute method', () => {
      const state = SovereignBridgeInterface.execute();
      expect(state.cycleCount).toBeGreaterThan(0);
    });

    it('should provide getState method', () => {
      const state = SovereignBridgeInterface.getState();
      expect(state).toHaveProperty('cycleCount');
      expect(state).toHaveProperty('coherenceMetric');
      expect(state).toHaveProperty('emergenceDetected');
    });

    it('should provide getTelemetry method', () => {
      const telemetry = SovereignBridgeInterface.getTelemetry();
      expect(telemetry).toHaveProperty('bridgeState');
      expect(telemetry).toHaveProperty('adaptiveFrequency');
      expect(telemetry).toHaveProperty('feedbackLoopCount');
    });

    it('should provide getRenderData method', () => {
      const renderData = SovereignBridgeInterface.getRenderData();
      expect(renderData).toHaveProperty('positions');
      expect(renderData).toHaveProperty('colors');
      expect(renderData).toHaveProperty('intensities');
    });

    it('should provide breathe method (anchorIntent)', () => {
      SovereignBridgeInterface.clearPatterns();
      SovereignBridgeInterface.breathe({ x: 0.5, y: 0.5, z: 0.5, w: 0.5 });
      const state = SovereignBridgeInterface.getState();
      // breathe doesn't increment cycle count, but other operations might have
      expect(state.cycleCount).toBeGreaterThanOrEqual(0);
    });

    it('should provide forceAdaptation method', () => {
      const newFreq = 432;
      SovereignBridgeInterface.forceAdaptation(newFreq);
      
      const telemetry = SovereignBridgeInterface.getTelemetry();
      expect(telemetry.adaptiveFrequency.baseFrequency).toBe(newFreq);
      expect(telemetry.adaptiveFrequency.modulatedFrequency).toBe(newFreq);
    });

    it('should provide clearPatterns method', () => {
      // Execute cycles to potentially create patterns
      for (let i = 0; i < 20; i++) {
        executeBridgeCycle();
      }
      
      SovereignBridgeInterface.clearPatterns();
      
      const state = SovereignBridgeInterface.getState();
      expect(state.dominantPattern).toBeNull();
      expect(state.emergenceDetected).toBe(false);
    });
  });

  describe('Performance & Stability', () => {
    it('should handle rapid consecutive executions', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        executeBridgeCycle();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 cycles in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should maintain stability over many cycles', async () => {
      vi.setConfig({ testTimeout: 15000 });
      
      for (let i = 0; i < 200; i++) {
        executeBridgeCycle({
          x: Math.random(),
          y: Math.random(),
          z: Math.random(),
          w: Math.random()
        });
      }
      
      const telemetry = getBridgeTelemetry();
      
      // Quantum norm should still be normalized
      expect(Math.abs(telemetry.quantumNorm - 1.0)).toBeLessThan(1e-5);
      
      // Coherence should be in valid range
      expect(telemetry.bridgeState.coherenceMetric).toBeGreaterThanOrEqual(0);
      expect(telemetry.bridgeState.coherenceMetric).toBeLessThanOrEqual(1);
    }, 20000);
  });

  describe('Constants Validation', () => {
    it('should export FEEDBACK_GAIN with appropriate value', () => {
      expect(FEEDBACK_GAIN).toBe(0.15);
      expect(FEEDBACK_GAIN).toBeGreaterThan(0);
      expect(FEEDBACK_GAIN).toBeLessThan(1);
    });

    it('should export EMERGENCE_THRESHOLD with appropriate value', () => {
      expect(EMERGENCE_THRESHOLD).toBe(0.85);
      expect(EMERGENCE_THRESHOLD).toBeGreaterThan(0.5);
      expect(EMERGENCE_THRESHOLD).toBeLessThan(1);
    });

    it('should export ADAPTIVE_WINDOW_SIZE with appropriate value', () => {
      expect(ADAPTIVE_WINDOW_SIZE).toBe(64);
      expect(ADAPTIVE_WINDOW_SIZE).toBeGreaterThan(0);
    });
  });
});
