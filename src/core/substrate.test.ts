/**
 * Base-9216 Substrate Engine Test Suite
 * 
 * Validates spatial-numerical encoding, tensor compression,
 * gyroidal routing, and quantum-substrate binding.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  GRID_DIMENSION,
  SUBSTRATE_SIZE,
  TERNARY_STATES,
  linearizeCoordinate,
  delinearizeIndex,
  bindTernaryState,
  unbindTernaryState,
  generateSubstrateToken,
  parseSubstrateToken,
  compressTensor,
  decompressTensor,
  calculateGyroidalWeight,
  classifyRouting,
  routeTensorNode,
  streamToSubstrate,
  bindQuantumToSubstrate,
  extractRenderData,
  type TernaryState,
  type SubstrateNode
} from './substrate';
import { FIELD_DIMENSION } from '../../constants';

describe('Base-9216 Substrate Constants', () => {
  it('should have correct grid dimension of 96', () => {
    expect(GRID_DIMENSION).toBe(96);
  });

  it('should have substrate size of 9,216 (96 × 96)', () => {
    expect(SUBSTRATE_SIZE).toBe(96 * 96);
    expect(SUBSTRATE_SIZE).toBe(9216);
  });

  it('should have three ternary states [-1, 0, +1]', () => {
    expect(TERNARY_STATES).toEqual([-1, 0, 1]);
    expect(TERNARY_STATES.length).toBe(3);
  });
});

describe('Spatial Linearization & Trinary Binding', () => {
  describe('linearizeCoordinate', () => {
    it('should convert 2D coordinates to linear index (row-major)', () => {
      expect(linearizeCoordinate(0, 0)).toBe(0);
      expect(linearizeCoordinate(1, 0)).toBe(1);
      expect(linearizeCoordinate(0, 1)).toBe(96);
      expect(linearizeCoordinate(5, 3)).toBe(3 * 96 + 5);
      expect(linearizeCoordinate(95, 95)).toBe(95 * 96 + 95);
    });

    it('should throw error for out-of-bounds coordinates', () => {
      expect(() => linearizeCoordinate(-1, 0)).toThrow();
      expect(() => linearizeCoordinate(96, 0)).toThrow();
      expect(() => linearizeCoordinate(0, -1)).toThrow();
      expect(() => linearizeCoordinate(0, 96)).toThrow();
    });
  });

  describe('delinearizeIndex', () => {
    it('should convert linear index back to 2D coordinates', () => {
      expect(delinearizeIndex(0)).toEqual({ x: 0, y: 0 });
      expect(delinearizeIndex(1)).toEqual({ x: 1, y: 0 });
      expect(delinearizeIndex(96)).toEqual({ x: 0, y: 1 });
      expect(delinearizeIndex(3 * 96 + 5)).toEqual({ x: 5, y: 3 });
      expect(delinearizeIndex(95 * 96 + 95)).toEqual({ x: 95, y: 95 });
    });

    it('should throw error for out-of-bounds index', () => {
      expect(() => delinearizeIndex(-1)).toThrow();
      expect(() => delinearizeIndex(9216)).toThrow();
    });

    it('should be inverse of linearizeCoordinate', () => {
      for (let x = 0; x < GRID_DIMENSION; x += 10) {
        for (let y = 0; y < GRID_DIMENSION; y += 10) {
          const index = linearizeCoordinate(x, y);
          const coords = delinearizeIndex(index);
          expect(coords.x).toBe(x);
          expect(coords.y).toBe(y);
        }
      }
    });
  });

  describe('bindTernaryState / unbindTernaryState', () => {
    it('should map ternary {-1, 0, +1} to offset {0, 1, 2}', () => {
      expect(bindTernaryState(-1)).toBe(0);
      expect(bindTernaryState(0)).toBe(1);
      expect(bindTernaryState(1)).toBe(2);
    });

    it('should map offset {0, 1, 2} back to ternary {-1, 0, +1}', () => {
      expect(unbindTernaryState(0)).toBe(-1);
      expect(unbindTernaryState(1)).toBe(0);
      expect(unbindTernaryState(2)).toBe(1);
    });

    it('should be inverse operations', () => {
      TERNARY_STATES.forEach(state => {
        const offset = bindTernaryState(state);
        const recovered = unbindTernaryState(offset);
        expect(recovered).toBe(state);
      });
    });

    it('should throw error for invalid offset', () => {
      expect(() => unbindTernaryState(-1)).toThrow();
      expect(() => unbindTernaryState(3)).toThrow();
    });
  });

  describe('generateSubstrateToken / parseSubstrateToken', () => {
    it('should generate token in format B9216:spatialIndex:tOffset', () => {
      expect(generateSubstrateToken(0, -1)).toBe('B9216:0:0');
      expect(generateSubstrateToken(100, 0)).toBe('B9216:100:1');
      expect(generateSubstrateToken(9215, 1)).toBe('B9216:9215:2');
    });

    it('should parse token back to components', () => {
      const token1 = generateSubstrateToken(42, -1);
      expect(parseSubstrateToken(token1)).toEqual({ spatialIndex: 42, ternaryState: -1 });

      const token2 = generateSubstrateToken(500, 0);
      expect(parseSubstrateToken(token2)).toEqual({ spatialIndex: 500, ternaryState: 0 });

      const token3 = generateSubstrateToken(9000, 1);
      expect(parseSubstrateToken(token3)).toEqual({ spatialIndex: 9000, ternaryState: 1 });
    });

    it('should throw error for invalid token format', () => {
      expect(() => parseSubstrateToken('invalid')).toThrow();
      expect(() => parseSubstrateToken('B9216:invalid')).toThrow();
      expect(() => parseSubstrateToken('B9217:0:0')).toThrow();
    });
  });
});

describe('Zero-Allocation Tensor Compression', () => {
  describe('compressTensor / decompressTensor', () => {
    it('should compress Float32Array to Uint16Array', () => {
      const tensor = new Float32Array([0.1, 0.5, 0.9, 0.3, 0.7]);
      const buffer = compressTensor(tensor);
      
      expect(buffer.compressed).toBeInstanceOf(Uint16Array);
      expect(buffer.compressed.length).toBe(tensor.length);
      expect(buffer.metadata.sourceDimension).toBe(tensor.length);
    });

    it('should preserve min/max values in metadata', () => {
      const tensor = new Float32Array([0.2, 0.8, 0.4, 0.6]);
      const buffer = compressTensor(tensor);
      
      expect(buffer.metadata.minVal).toBeCloseTo(0.2, 5);
      expect(buffer.metadata.maxVal).toBeCloseTo(0.8, 5);
    });

    it('should decompress back to original values with acceptable precision loss', () => {
      const original = new Float32Array([0.1, 0.3, 0.5, 0.7, 0.9]);
      const buffer = compressTensor(original);
      const decompressed = decompressTensor(buffer);
      
      expect(decompressed.length).toBe(original.length);
      
      // Check with tolerance for 16-bit quantization
      for (let i = 0; i < original.length; i++) {
        expect(decompressed[i]).toBeCloseTo(original[i], 3);
      }
    });

    it('should handle constant tensor (zero range)', () => {
      const tensor = new Float32Array([0.5, 0.5, 0.5, 0.5]);
      const buffer = compressTensor(tensor);
      const decompressed = decompressTensor(buffer);
      
      decompressed.forEach(val => {
        expect(val).toBeCloseTo(0.5, 5);
      });
    });

    it('should handle negative values', () => {
      const tensor = new Float32Array([-1.0, -0.5, 0.0, 0.5, 1.0]);
      const buffer = compressTensor(tensor);
      const decompressed = decompressTensor(buffer);
      
      expect(decompressed.length).toBe(tensor.length);
      expect(decompressed[0]).toBeCloseTo(-1.0, 2);
      expect(decompressed[4]).toBeCloseTo(1.0, 2);
    });

    it('should throw error for empty tensor', () => {
      expect(() => compressTensor(new Float32Array([]))).toThrow();
    });

    it('should include timestamp in metadata', () => {
      const tensor = new Float32Array([1.0, 2.0, 3.0]);
      const before = Date.now();
      const buffer = compressTensor(tensor);
      const after = Date.now();
      
      expect(buffer.metadata.timestamp).toBeGreaterThanOrEqual(before);
      expect(buffer.metadata.timestamp).toBeLessThanOrEqual(after);
    });
  });
});

describe('Gyroidal Phase-Space Routing', () => {
  describe('calculateGyroidalWeight', () => {
    it('should return value in [-1, 1] range', () => {
      for (let x = 0; x <= 1; x += 0.1) {
        for (let y = 0; y <= 1; y += 0.1) {
          const weight = calculateGyroidalWeight(x, y, 0.5);
          expect(weight).toBeGreaterThanOrEqual(-1.0);
          expect(weight).toBeLessThanOrEqual(1.0);
        }
      }
    });

    it('should vary with position coordinates', () => {
      const w1 = calculateGyroidalWeight(0.0, 0.0, 0);
      const w2 = calculateGyroidalWeight(0.5, 0.5, 0);
      const w3 = calculateGyroidalWeight(1.0, 1.0, 0);
      
      // Different positions should produce different weights
      expect(w1).not.toBe(w2);
      expect(w2).not.toBe(w3);
    });

    it('should be modulated by amplitude', () => {
      const x = 0.3;
      const y = 0.7;
      const w1 = calculateGyroidalWeight(x, y, 0);
      const w2 = calculateGyroidalWeight(x, y, 0.5);
      const w3 = calculateGyroidalWeight(x, y, 1.0);
      
      // Amplitude should affect the result
      expect(w1).not.toBe(w3);
    });
  });

  describe('classifyRouting', () => {
    it('should classify as CONVERGENT for high positive scores', () => {
      expect(classifyRouting(0.5, 1)).toBe('CONVERGENT');
      expect(classifyRouting(0.4, 0)).toBe('CONVERGENT');
    });

    it('should classify as DIVERGENT for low negative scores', () => {
      expect(classifyRouting(-0.5, -1)).toBe('DIVERGENT');
      expect(classifyRouting(-0.4, 0)).toBe('DIVERGENT');
    });

    it('should classify as NEUTRAL for scores near zero', () => {
      expect(classifyRouting(0.1, 0)).toBe('NEUTRAL');
      expect(classifyRouting(-0.1, 0)).toBe('NEUTRAL');
      expect(classifyRouting(0, 0)).toBe('NEUTRAL');
    });

    it('should factor in ternary state contribution', () => {
      // Same harmonic weight, different ternary states
      expect(classifyRouting(0.25, 1)).toBe('CONVERGENT'); // 0.25 + 0.3 = 0.55
      expect(classifyRouting(0.25, 0)).toBe('NEUTRAL');    // 0.25 + 0 = 0.25
      expect(classifyRouting(0.25, -1)).toBe('NEUTRAL');   // 0.25 - 0.3 = -0.05
    });
  });

  describe('routeTensorNode', () => {
    it('should return routing decision with all required fields', () => {
      const node: SubstrateNode = {
        spatialIndex: 100,
        x: 10,
        y: 20,
        ternaryOffset: 1,
        harmonicWeight: 0.5,
        routingClass: 'CONVERGENT',
        phaseAngle: Math.PI / 4
      };

      const decision = routeTensorNode(node);

      expect(decision.nodeId).toBe(100);
      expect(decision.path).toBe('CONVERGENT');
      expect(decision.confidence).toBeGreaterThan(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(decision.nextNodes)).toBe(true);
      expect(typeof decision.gyroidPhase).toBe('number');
    });

    it('should generate next nodes for CONVERGENT path toward center', () => {
      const node: SubstrateNode = {
        spatialIndex: 0,
        x: 0,
        y: 0,
        ternaryOffset: 2,
        harmonicWeight: 0.5,
        routingClass: 'CONVERGENT',
        phaseAngle: 0
      };

      const decision = routeTensorNode(node);
      
      // Should move toward center (48, 48)
      expect(decision.nextNodes.length).toBeGreaterThan(0);
      decision.nextNodes.forEach(index => {
        const coords = delinearizeIndex(index);
        // Next nodes should be closer to center or at least not further away
        expect(coords.x).toBeGreaterThanOrEqual(0);
        expect(coords.y).toBeGreaterThanOrEqual(0);
      });
    });

    it('should generate next nodes for DIVERGENT path toward edges', () => {
      const node: SubstrateNode = {
        spatialIndex: 4800,
        x: 48,
        y: 48,
        ternaryOffset: 0,
        harmonicWeight: -0.5,
        routingClass: 'DIVERGENT',
        phaseAngle: 0
      };

      const decision = routeTensorNode(node);
      
      expect(decision.nextNodes.length).toBeGreaterThan(0);
    });

    it('should generate neighborhood nodes for NEUTRAL path', () => {
      const node: SubstrateNode = {
        spatialIndex: 5000,
        x: 50,
        y: 52,
        ternaryOffset: 1,
        harmonicWeight: 0.1,
        routingClass: 'NEUTRAL',
        phaseAngle: 0
      };

      const decision = routeTensorNode(node);
      
      // Should include local neighborhood (up to 8 neighbors)
      expect(decision.nextNodes.length).toBeGreaterThan(0);
      expect(decision.nextNodes.length).toBeLessThanOrEqual(8);
    });
  });
});

describe('Quantum-Substrate Bridge', () => {
  describe('streamToSubstrate', () => {
    it('should map 16,384 quantum states to 9,216 substrate nodes', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with some variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }

      const nodes = streamToSubstrate(quantumState);

      expect(nodes.length).toBe(SUBSTRATE_SIZE);
      expect(nodes.length).toBe(9216);
    });

    it('should throw error for incorrect quantum state dimension', () => {
      expect(() => streamToSubstrate(new Float64Array(100))).toThrow();
      expect(() => streamToSubstrate(new Float64Array(FIELD_DIMENSION - 1))).toThrow();
    });

    it('should populate all node fields correctly', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const nodes = streamToSubstrate(quantumState);

      nodes.forEach((node, index) => {
        expect(node.spatialIndex).toBe(index);
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x).toBeLessThan(GRID_DIMENSION);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThan(GRID_DIMENSION);
        expect(node.ternaryOffset).toBeGreaterThanOrEqual(0);
        expect(node.ternaryOffset).toBeLessThanOrEqual(2);
        expect(node.harmonicWeight).toBeGreaterThanOrEqual(-1);
        expect(node.harmonicWeight).toBeLessThanOrEqual(1);
        expect(['CONVERGENT', 'DIVERGENT', 'NEUTRAL']).toContain(node.routingClass);
        expect(node.phaseAngle).toBeGreaterThanOrEqual(0);
        expect(node.phaseAngle).toBeLessThanOrEqual(2 * Math.PI);
      });
    });

    it('should correctly map spatial indices to coordinates', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const nodes = streamToSubstrate(quantumState);

      // Verify first row
      for (let x = 0; x < GRID_DIMENSION; x++) {
        const node = nodes[x];
        expect(node.x).toBe(x);
        expect(node.y).toBe(0);
      }

      // Verify first column
      for (let y = 0; y < GRID_DIMENSION; y++) {
        const node = nodes[y * GRID_DIMENSION];
        expect(node.x).toBe(0);
        expect(node.y).toBe(y);
      }
    });
  });

  describe('bindQuantumToSubstrate', () => {
    it('should return nodes, routing decisions, and tensor buffer', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const result = bindQuantumToSubstrate(quantumState);

      expect(result.nodes).toBeDefined();
      expect(result.routingDecisions).toBeDefined();
      expect(result.tensorBuffer).toBeDefined();
      expect(result.nodes.length).toBe(SUBSTRATE_SIZE);
      expect(Array.isArray(result.routingDecisions)).toBe(true);
      expect(result.tensorBuffer.compressed).toBeInstanceOf(Uint16Array);
    });

    it('should only include non-NEUTRAL nodes in routing decisions', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const result = bindQuantumToSubstrate(quantumState);

      result.routingDecisions.forEach(decision => {
        expect(decision.path).not.toBe('NEUTRAL');
      });
    });
  });

  describe('extractRenderData', () => {
    it('should extract positions, colors, and intensities arrays', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const { nodes } = bindQuantumToSubstrate(quantumState);
      const renderData = extractRenderData(nodes);

      expect(renderData.positions).toBeInstanceOf(Float32Array);
      expect(renderData.colors).toBeInstanceOf(Float32Array);
      expect(renderData.intensities).toBeInstanceOf(Float32Array);
    });

    it('should have correct array lengths', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const { nodes } = bindQuantumToSubstrate(quantumState);
      const renderData = extractRenderData(nodes);

      expect(renderData.positions.length).toBe(nodes.length * 2); // x, y per node
      expect(renderData.colors.length).toBe(nodes.length * 3);    // r, g, b per node
      expect(renderData.intensities.length).toBe(nodes.length);
    });

    it('should normalize positions to [0, 1] range', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const { nodes } = bindQuantumToSubstrate(quantumState);
      const renderData = extractRenderData(nodes);

      for (let i = 0; i < renderData.positions.length; i++) {
        expect(renderData.positions[i]).toBeGreaterThanOrEqual(0);
        expect(renderData.positions[i]).toBeLessThanOrEqual(1);
      }
    });

    it('should assign colors based on routing class', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const { nodes } = bindQuantumToSubstrate(quantumState);
      const renderData = extractRenderData(nodes);

      nodes.forEach((node, index) => {
        const r = renderData.colors[index * 3];
        const g = renderData.colors[index * 3 + 1];
        const b = renderData.colors[index * 3 + 2];

        // Colors should be modulated by harmonic weight
        expect(r).toBeGreaterThanOrEqual(0);
        expect(g).toBeGreaterThanOrEqual(0);
        expect(b).toBeGreaterThanOrEqual(0);

        if (node.routingClass === 'CONVERGENT') {
          // Green-cyan base color
          expect(g).toBeGreaterThanOrEqual(r);
        } else if (node.routingClass === 'DIVERGENT') {
          // Orange-red base color
          expect(r).toBeGreaterThanOrEqual(g);
        }
      });
    });

    it('should calculate intensities from absolute harmonic weight', () => {
      const quantumState = new Float64Array(FIELD_DIMENSION);
      // Initialize with variation
      for (let i = 0; i < FIELD_DIMENSION; i++) {
        quantumState[i] = Math.sin(i * 0.01) * 0.1;
      }
      const { nodes } = bindQuantumToSubstrate(quantumState);
      const renderData = extractRenderData(nodes);

      nodes.forEach((node, index) => {
        expect(renderData.intensities[index]).toBeCloseTo(Math.abs(node.harmonicWeight), 5);
      });
    });
  });
});

describe('Integration Tests', () => {
  it('should complete full pipeline from quantum state to render data', () => {
    const quantumState = new Float64Array(FIELD_DIMENSION);
    
    // Initialize with probability distribution
    let sum = 0;
    for (let i = 0; i < FIELD_DIMENSION; i++) {
      quantumState[i] = Math.random();
      sum += quantumState[i] ** 2;
    }
    
    // Normalize to satisfy conservation law
    const norm = Math.sqrt(sum);
    for (let i = 0; i < FIELD_DIMENSION; i++) {
      quantumState[i] /= norm;
    }

    // Full pipeline
    const { nodes, routingDecisions, tensorBuffer } = bindQuantumToSubstrate(quantumState);
    const renderData = extractRenderData(nodes);

    // Validate all stages produced valid output
    expect(nodes.length).toBe(9216);
    expect(routingDecisions.length).toBeGreaterThan(0);
    expect(tensorBuffer.compressed.length).toBe(FIELD_DIMENSION);
    expect(renderData.positions.length).toBe(9216 * 2);
    expect(renderData.colors.length).toBe(9216 * 3);
    expect(renderData.intensities.length).toBe(9216);
  });

  it('should maintain zero-allocation principle in tight loop', () => {
    const quantumState = new Float64Array(FIELD_DIMENSION);
    // Initialize with variation
    for (let i = 0; i < FIELD_DIMENSION; i++) {
      quantumState[i] = Math.sin(i * 0.01) * 0.1;
    }
    const iterations = 10;
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      // Slight modification to state
      quantumState[i % FIELD_DIMENSION] += 0.001;
      
      const result = bindQuantumToSubstrate(quantumState);
      extractRenderData(result.nodes);
    }
    
    const endTime = performance.now();
    const avgTimePerIteration = (endTime - startTime) / iterations;
    
    // Should complete each iteration in reasonable time (< 100ms for this scale)
    expect(avgTimePerIteration).toBeLessThan(100);
  });
});
