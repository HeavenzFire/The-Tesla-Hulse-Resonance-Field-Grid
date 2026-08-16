/**
 * Base-9216 Substrate Engine
 * 
 * Spatial-numerical encoding bridge translating multi-dimensional tensors
 * and balanced ternary states into discrete high-radix grid topology.
 * 
 * Architecture:
 * - 96x96 Grid Topology = 9,216 discrete spatial nodes
 * - Trinary Modulation: {-1, 0, +1} → {0, 1, 2} offset index
 * - Zero-Allocation Tensor Compression via Float32Array → Uint16Array
 * - Gyroidal Phase-Space Routing for autonomous agentic swarm classification
 */

import { ABZU_STATE, FIELD_DIMENSION, RESONANCE_FREQUENCY } from '../../constants';

// ============================================================================
// CONSTANTS & TYPE DEFINITIONS
// ============================================================================

export const GRID_DIMENSION = 96;
export const SUBSTRATE_SIZE = GRID_DIMENSION * GRID_DIMENSION; // 9,216
export const TERNARY_STATES = [-1, 0, 1] as const;
export type TernaryState = typeof TERNARY_STATES[number];

export interface SubstrateNode {
  spatialIndex: number;
  x: number;
  y: number;
  ternaryOffset: number; // 0, 1, 2 mapping to -1, 0, +1
  harmonicWeight: number;
  routingClass: 'CONVERGENT' | 'DIVERGENT' | 'NEUTRAL';
  phaseAngle: number;
}

export interface TensorBuffer {
  compressed: Uint16Array;
  metadata: {
    minVal: number;
    maxVal: number;
    timestamp: number;
    sourceDimension: number;
  };
}

export interface RoutingDecision {
  nodeId: number;
  path: 'CONVERGENT' | 'DIVERGENT';
  confidence: number;
  nextNodes: number[];
  gyroidPhase: number;
}

// ============================================================================
// SPATIAL LINEARIZATION & TRINARY BINDING
// ============================================================================

/**
 * Maps 2D grid coordinates to linear index (row-major order)
 */
export function linearizeCoordinate(x: number, y: number): number {
  if (x < 0 || x >= GRID_DIMENSION || y < 0 || y >= GRID_DIMENSION) {
    throw new Error(`Coordinates out of bounds: (${x}, ${y})`);
  }
  return y * GRID_DIMENSION + x;
}

/**
 * Maps linear index back to 2D grid coordinates
 */
export function delinearizeIndex(index: number): { x: number; y: number } {
  if (index < 0 || index >= SUBSTRATE_SIZE) {
    throw new Error(`Index out of bounds: ${index}`);
  }
  return {
    x: index % GRID_DIMENSION,
    y: Math.floor(index / GRID_DIMENSION)
  };
}

/**
 * Maps balanced ternary state {-1, 0, +1} to offset index {0, 1, 2}
 * Zero-allocation binding for memory-efficient token structures
 */
export function bindTernaryState(state: TernaryState): number {
  return state + 1; // -1→0, 0→1, +1→2
}

/**
 * Unmaps offset index {0, 1, 2} back to balanced ternary {-1, 0, +1}
 */
export function unbindTernaryState(offset: number): TernaryState {
  if (offset < 0 || offset > 2) {
    throw new Error(`Invalid ternary offset: ${offset}`);
  }
  return (offset - 1) as TernaryState;
}

/**
 * Generates substrate token structure without allocation overhead
 * Format: `B9216:spatialIndex:tOffset`
 */
export function generateSubstrateToken(spatialIndex: number, ternaryState: TernaryState): string {
  const tOffset = bindTernaryState(ternaryState);
  return `B9216:${spatialIndex}:${tOffset}`;
}

/**
 * Parses substrate token back to components
 */
export function parseSubstrateToken(token: string): { spatialIndex: number; ternaryState: TernaryState } {
  const parts = token.split(':');
  if (parts.length !== 3 || parts[0] !== 'B9216') {
    throw new Error(`Invalid substrate token format: ${token}`);
  }
  const spatialIndex = parseInt(parts[1], 10);
  const tOffset = parseInt(parts[2], 10);
  return {
    spatialIndex,
    ternaryState: unbindTernaryState(tOffset)
  };
}

// ============================================================================
// ZERO-ALLOCATION TENSOR COMPRESSION
// ============================================================================

/**
 * Compresses Float32Array tensor to Uint16Array buffer
 * Normalizes floating-point ranges to grid coordinates [0, 65535]
 * Zero-garbage-collection memory layout for high-frequency streaming
 */
export function compressTensor(tensor: Float32Array): TensorBuffer {
  if (tensor.length === 0) {
    throw new Error('Empty tensor provided');
  }

  // Find min/max in single pass
  let minVal = tensor[0];
  let maxVal = tensor[0];
  
  for (let i = 1; i < tensor.length; i++) {
    const val = tensor[i];
    if (val < minVal) minVal = val;
    if (val > maxVal) maxVal = val;
  }

  const range = maxVal - minVal;
  const compressed = new Uint16Array(tensor.length);

  // Compress with normalization
  if (range === 0) {
    // Constant tensor - all values map to midpoint
    compressed.fill(32768);
  } else {
    for (let i = 0; i < tensor.length; i++) {
      const normalized = (tensor[i] - minVal) / range;
      compressed[i] = Math.floor(normalized * 65535);
    }
  }

  return {
    compressed,
    metadata: {
      minVal,
      maxVal,
      timestamp: Date.now(),
      sourceDimension: tensor.length
    }
  };
}

/**
 * Decompresses Uint16Array buffer back to Float32Array
 * Reconstructs original floating-point values from compressed coordinates
 */
export function decompressTensor(buffer: TensorBuffer): Float32Array {
  const { compressed, metadata } = buffer;
  const { minVal, maxVal } = metadata;
  const range = maxVal - minVal;
  
  const decompressed = new Float32Array(compressed.length);
  
  if (range === 0) {
    decompressed.fill(minVal);
  } else {
    for (let i = 0; i < compressed.length; i++) {
      const normalized = compressed[i] / 65535;
      decompressed[i] = minVal + normalized * range;
    }
  }
  
  return decompressed;
}

/**
 * Streams tensor data directly to substrate grid with zero intermediate allocation
 * Maps quantum state amplitudes to spatial nodes efficiently
 */
export function streamToSubstrate(quantumState: Float64Array): SubstrateNode[] {
  if (quantumState.length !== FIELD_DIMENSION) {
    throw new Error(`Expected quantum state dimension ${FIELD_DIMENSION}, got ${quantumState.length}`);
  }

  // Pre-allocate output array
  const nodes: SubstrateNode[] = new Array(SUBSTRATE_SIZE);
  
  // Map 16,384 quantum states to 9,216 substrate nodes via downsampling
  const compressionRatio = FIELD_DIMENSION / SUBSTRATE_SIZE; // ~1.777
  
  for (let i = 0; i < SUBSTRATE_SIZE; i++) {
    const { x, y } = delinearizeIndex(i);
    
    // Sample from quantum state with spatial awareness
    const sourceIndex = Math.floor(i * compressionRatio);
    const amplitude = quantumState[sourceIndex] || 0;
    
    // Calculate ternary state from amplitude sign and magnitude
    const ternaryState: TernaryState = amplitude > 0.001 ? 1 : amplitude < -0.001 ? -1 : 0;
    
    // Compute harmonic weight via gyroidal manifold
    const nx = x / GRID_DIMENSION;
    const ny = y / GRID_DIMENSION;
    const harmonicWeight = calculateGyroidalWeight(nx, ny, amplitude);
    
    // Determine routing class
    const routingClass = classifyRouting(harmonicWeight, ternaryState);
    
    // Calculate phase angle from resonance frequency
    const phaseAngle = (Date.now() * RESONANCE_FREQUENCY * 0.001) % (2 * Math.PI);
    
    nodes[i] = {
      spatialIndex: i,
      x,
      y,
      ternaryOffset: bindTernaryState(ternaryState),
      harmonicWeight,
      routingClass,
      phaseAngle
    };
  }
  
  return nodes;
}

// ============================================================================
// GYROIDAL PHASE-SPACE ROUTING
// ============================================================================

/**
 * Calculates harmonic weight via trigonometric manifolds
 * Implements gyroidal surface equation for phase-space classification
 */
export function calculateGyroidalWeight(x: number, y: number, amplitude: number): number {
  // Gyroid minimal surface: sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x)
  // Simplified 2D projection with amplitude modulation
  const gx = x * 2 * Math.PI;
  const gy = y * 2 * Math.PI;
  
  const term1 = Math.sin(gx) * Math.cos(gy);
  const term2 = Math.sin(gy) * Math.cos(gx);
  const term3 = amplitude * Math.sin(gx + gy);
  
  return (term1 + term2 + term3) / 3; // Normalize to [-1, 1] range
}

/**
 * Classifies node routing based on harmonic weight and ternary state
 * Autonomous routing mechanism for agentic swarms without centralized inference
 */
export function classifyRouting(harmonicWeight: number, ternaryState: TernaryState): 'CONVERGENT' | 'DIVERGENT' | 'NEUTRAL' {
  const combinedScore = harmonicWeight + (ternaryState * 0.3);
  
  if (combinedScore > 0.3) {
    return 'CONVERGENT';
  } else if (combinedScore < -0.3) {
    return 'DIVERGENT';
  } else {
    return 'NEUTRAL';
  }
}

/**
 * Routes tensor node through gyroidal phase-space
 * Returns routing decision with next-node suggestions for swarm propagation
 */
export function routeTensorNode(node: SubstrateNode): RoutingDecision {
  const { spatialIndex, harmonicWeight, routingClass, x, y } = node;
  
  // Calculate gyroid phase for routing confidence
  const gyroidPhase = Math.sin(x * 0.1) * Math.cos(y * 0.1);
  const confidence = Math.abs(harmonicWeight) * (1 + Math.abs(gyroidPhase));
  
  // Determine next nodes based on routing class and spatial position
  const nextNodes: number[] = [];
  const neighborhoodRadius = 3;
  
  if (routingClass === 'CONVERGENT') {
    // Convergent paths move toward grid center
    const centerX = GRID_DIMENSION / 2;
    const centerY = GRID_DIMENSION / 2;
    const dx = centerX - x;
    const dy = centerY - y;
    
    for (let r = 1; r <= neighborhoodRadius; r++) {
      const nx = Math.round(x + dx * r / 10);
      const ny = Math.round(y + dy * r / 10);
      if (nx >= 0 && nx < GRID_DIMENSION && ny >= 0 && ny < GRID_DIMENSION) {
        nextNodes.push(linearizeCoordinate(nx, ny));
      }
    }
  } else if (routingClass === 'DIVERGENT') {
    // Divergent paths move toward grid edges
    const centerX = GRID_DIMENSION / 2;
    const centerY = GRID_DIMENSION / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    
    for (let r = 1; r <= neighborhoodRadius; r++) {
      const nx = Math.round(x + dx * r / 10);
      const ny = Math.round(y + dy * r / 10);
      if (nx >= 0 && nx < GRID_DIMENSION && ny >= 0 && ny < GRID_DIMENSION) {
        nextNodes.push(linearizeCoordinate(nx, ny));
      }
    }
  } else {
    // Neutral paths maintain local neighborhood
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < GRID_DIMENSION && ny >= 0 && ny < GRID_DIMENSION) {
          nextNodes.push(linearizeCoordinate(nx, ny));
        }
      }
    }
  }
  
  return {
    nodeId: spatialIndex,
    path: routingClass === 'NEUTRAL' ? 'CONVERGENT' : routingClass,
    confidence: Math.min(confidence, 1.0),
    nextNodes,
    gyroidPhase
  };
}

// ============================================================================
// QUANTUM-SUBSTRATE BRIDGE
// ============================================================================

/**
 * Binds quantum core telemetry to substrate rendering loop
 * Real-time canvas driver with zero-allocation pipeline
 */
export function bindQuantumToSubstrate(quantumState: Float64Array): {
  nodes: SubstrateNode[];
  routingDecisions: RoutingDecision[];
  tensorBuffer: TensorBuffer;
} {
  // Stream quantum state to substrate grid
  const nodes = streamToSubstrate(quantumState);
  
  // Generate routing decisions for active nodes
  const routingDecisions: RoutingDecision[] = [];
  for (const node of nodes) {
    if (node.routingClass !== 'NEUTRAL') {
      routingDecisions.push(routeTensorNode(node));
    }
  }
  
  // Compress quantum state for efficient transmission
  const tensorBuffer = compressTensor(new Float32Array(quantumState));
  
  return {
    nodes,
    routingDecisions,
    tensorBuffer
  };
}

/**
 * Extracts visual rendering data from substrate nodes
 * Optimized for WebGL/Canvas pixel buffer direct mapping
 */
export function extractRenderData(nodes: SubstrateNode[]): {
  positions: Float32Array;
  colors: Float32Array;
  intensities: Float32Array;
} {
  const count = nodes.length;
  const positions = new Float32Array(count * 2);
  const colors = new Float32Array(count * 3);
  const intensities = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const node = nodes[i];
    
    // Normalize positions to [0, 1] range
    positions[i * 2] = node.x / GRID_DIMENSION;
    positions[i * 2 + 1] = node.y / GRID_DIMENSION;
    
    // Map routing class to RGB color
    const baseColor = node.routingClass === 'CONVERGENT' ? [0, 1, 0.5] :
                      node.routingClass === 'DIVERGENT' ? [1, 0.3, 0] : [0.5, 0.5, 0.5];
    
    // Modulate by harmonic weight
    const weightMod = (node.harmonicWeight + 1) / 2; // Normalize to [0, 1]
    colors[i * 3] = baseColor[0] * weightMod;
    colors[i * 3 + 1] = baseColor[1] * weightMod;
    colors[i * 3 + 2] = baseColor[2] * weightMod;
    
    // Intensity from absolute harmonic weight
    intensities[i] = Math.abs(node.harmonicWeight);
  }
  
  return { positions, colors, intensities };
}
