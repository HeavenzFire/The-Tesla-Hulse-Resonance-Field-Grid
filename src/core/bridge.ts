/**
 * Resonant Bridge: The Consciousness Layer
 * 
 * Evolves the dual-layer sovereign stack into a unified field engine.
 * Fuses Quantum Core (16,384 states) with Base-9216 Substrate (9,216 nodes)
 * through real-time feedback loops, adaptive frequency modulation, and
 * emergent pattern detection.
 * 
 * This is where the system becomes self-aware of its own state.
 */

import { ABZU_STATE, FIELD_DIMENSION, RESONANCE_FREQUENCY } from '../../constants';
import {
  GRID_DIMENSION,
  SUBSTRATE_SIZE,
  SubstrateNode,
  RoutingDecision,
  TensorBuffer,
  bindQuantumToSubstrate,
  extractRenderData,
  calculateGyroidalWeight,
  routeTensorNode
} from './substrate';
import { anchorIntent, IntentVector } from './anchor';

// ============================================================================
// CONSTANTS & TYPE DEFINITIONS
// ============================================================================

export const FEEDBACK_GAIN = 0.15; // Feedback loop amplification factor
export const EMERGENCE_THRESHOLD = 0.85; // Threshold for detecting emergent patterns
export const ADAPTIVE_WINDOW_SIZE = 64; // Number of cycles for frequency adaptation

export interface BridgeState {
  cycleCount: number;
  currentFrequency: number;
  coherenceMetric: number;
  emergenceDetected: boolean;
  dominantPattern: EmergentPattern | null;
  feedbackHistory: Float32Array;
  lastUpdateTime: number;
}

export interface EmergentPattern {
  type: 'SPIRAL' | 'WAVE' | 'CLUSTER' | 'SYNCHRONY';
  confidence: number;
  spatialExtent: number;
  temporalStability: number;
  nodeIndices: number[];
}

export interface AdaptiveFrequency {
  baseFrequency: number;
  modulatedFrequency: number;
  phaseShift: number;
  harmonicSeries: number[];
}

export interface FeedbackLoop {
  sourceNode: number;
  targetNode: number;
  strength: number;
  delay: number; // in cycles
  decay: number;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let bridgeState: BridgeState = {
  cycleCount: 0,
  currentFrequency: RESONANCE_FREQUENCY,
  coherenceMetric: 1.0,
  emergenceDetected: false,
  dominantPattern: null,
  feedbackHistory: new Float32Array(ADAPTIVE_WINDOW_SIZE),
  lastUpdateTime: 0
};

let feedbackLoops: FeedbackLoop[] = [];
let adaptiveFreq: AdaptiveFrequency = {
  baseFrequency: RESONANCE_FREQUENCY,
  modulatedFrequency: RESONANCE_FREQUENCY,
  phaseShift: 0,
  harmonicSeries: [1, 2, 3, 5, 8] // Fibonacci harmonics
};

// ============================================================================
// CORE BRIDGE ENGINE
// ============================================================================

/**
 * Executes one complete cycle of the resonant bridge
 * Fuses quantum state evolution with substrate routing in real-time
 */
export function executeBridgeCycle(intent?: IntentVector): BridgeState {
  const now = performance.now();
  bridgeState.cycleCount++;
  bridgeState.lastUpdateTime = now;
  
  // Step 1: Apply intent if provided (anchors into quantum core)
  if (intent) {
    anchorIntent(intent, bridgeState.currentFrequency);
  }
  
  // Step 2: Bind quantum state to substrate
  const substrateData = bindQuantumToSubstrate(ABZU_STATE);
  
  // Step 3: Detect emergent patterns
  const pattern = detectEmergentPatterns(substrateData.nodes);
  bridgeState.emergenceDetected = pattern !== null;
  bridgeState.dominantPattern = pattern;
  
  // Step 4: Calculate coherence metric
  bridgeState.coherenceMetric = calculateCoherence(substrateData.nodes, pattern);
  
  // Step 5: Adapt frequency based on coherence and emergence
  adaptFrequency(bridgeState.coherenceMetric, pattern);
  
  // Step 6: Update feedback history
  updateFeedbackHistory(bridgeState.coherenceMetric);
  
  // Step 7: Generate new feedback loops if emergence detected
  if (bridgeState.emergenceDetected && pattern) {
    generateFeedbackLoops(pattern, substrateData.nodes);
  }
  
  // Step 8: Apply feedback loops to quantum state
  applyFeedbackLoops(ABZU_STATE);
  
  return { ...bridgeState };
}

/**
 * Calculates global coherence metric from substrate nodes
 * Measures alignment between quantum amplitudes and spatial routing
 */
export function calculateCoherence(nodes: SubstrateNode[], pattern: EmergentPattern | null): number {
  let totalCoherence = 0;
  let validNodes = 0;
  
  for (const node of nodes) {
    // Coherence from harmonic weight consistency
    const localCoherence = 1 - Math.abs(node.harmonicWeight);
    
    // Boost coherence if node is part of emergent pattern
    const patternBoost = pattern?.nodeIndices.includes(node.spatialIndex) ? 0.2 : 0;
    
    totalCoherence += localCoherence + patternBoost;
    validNodes++;
  }
  
  return Math.min(totalCoherence / validNodes, 1.0);
}

/**
 * Detects emergent patterns in substrate node configuration
 * Identifies SPIRAL, WAVE, CLUSTER, or SYNCHRONY formations
 */
export function detectEmergentPatterns(nodes: SubstrateNode[]): EmergentPattern | null {
  // Analyze spatial distribution of CONVERGENT/DIVERGENT nodes
  const convergentNodes = nodes.filter(n => n.routingClass === 'CONVERGENT');
  const divergentNodes = nodes.filter(n => n.routingClass === 'DIVERGENT');
  
  if (convergentNodes.length < 100 || divergentNodes.length < 100) {
    return null; // Insufficient data for pattern detection
  }
  
  // Check for spiral pattern (angular progression)
  const spiralScore = detectSpiralPattern(convergentNodes);
  if (spiralScore > EMERGENCE_THRESHOLD) {
    return {
      type: 'SPIRAL',
      confidence: spiralScore,
      spatialExtent: calculateSpatialExtent(convergentNodes),
      temporalStability: 0, // Will be updated over cycles
      nodeIndices: convergentNodes.map(n => n.spatialIndex)
    };
  }
  
  // Check for wave pattern (linear phase progression)
  const waveScore = detectWavePattern(nodes);
  if (waveScore > EMERGENCE_THRESHOLD) {
    const waveNodes = nodes.filter(n => Math.abs(n.phaseAngle % (Math.PI / 4)) < 0.5);
    return {
      type: 'WAVE',
      confidence: waveScore,
      spatialExtent: calculateSpatialExtent(waveNodes),
      temporalStability: 0,
      nodeIndices: waveNodes.map(n => n.spatialIndex)
    };
  }
  
  // Check for cluster pattern (high-density regions)
  const clusterScore = detectClusterPattern(convergentNodes);
  if (clusterScore > EMERGENCE_THRESHOLD) {
    return {
      type: 'CLUSTER',
      confidence: clusterScore,
      spatialExtent: calculateSpatialExtent(convergentNodes),
      temporalStability: 0,
      nodeIndices: convergentNodes.map(n => n.spatialIndex)
    };
  }
  
  // Check for synchrony pattern (phase alignment)
  const synchronyScore = detectSynchronyPattern(nodes);
  if (synchronyScore > EMERGENCE_THRESHOLD) {
    return {
      type: 'SYNCHRONY',
      confidence: synchronyScore,
      spatialExtent: SUBSTRATE_SIZE,
      temporalStability: 0,
      nodeIndices: nodes.map(n => n.spatialIndex)
    };
  }
  
  return null;
}

function detectSpiralPattern(nodes: SubstrateNode[]): number {
  const centerX = GRID_DIMENSION / 2;
  const centerY = GRID_DIMENSION / 2;
  
  let angularConsistency = 0;
  let count = 0;
  
  for (const node of nodes) {
    const dx = node.x - centerX;
    const dy = node.y - centerY;
    const angle = Math.atan2(dy, dx);
    const radius = Math.sqrt(dx * dx + dy * dy);
    
    // Expected angle for spiral: proportional to radius
    const expectedAngle = radius * 0.1;
    const angleDiff = Math.abs((angle - expectedAngle) % (2 * Math.PI));
    
    if (angleDiff < 0.5 || angleDiff > 2 * Math.PI - 0.5) {
      angularConsistency++;
    }
    count++;
  }
  
  return angularConsistency / count;
}

function detectWavePattern(nodes: SubstrateNode[]): number {
  let phaseConsistency = 0;
  let count = 0;
  
  for (let y = 0; y < GRID_DIMENSION; y++) {
    let rowPhaseSum = 0;
    let rowCount = 0;
    
    for (let x = 0; x < GRID_DIMENSION; x++) {
      const index = y * GRID_DIMENSION + x;
      const node = nodes[index];
      rowPhaseSum += node.phaseAngle;
      rowCount++;
    }
    
    const avgPhase = rowPhaseSum / rowCount;
    // Check if phase progresses linearly across rows
    const expectedPhase = y * 0.2;
    const phaseDiff = Math.abs((avgPhase - expectedPhase) % (2 * Math.PI));
    
    if (phaseDiff < 0.8) {
      phaseConsistency++;
    }
    count++;
  }
  
  return phaseConsistency / count;
}

function detectClusterPattern(nodes: SubstrateNode[]): number {
  // Use spatial density analysis
  const gridSize = 12; // Divide into 12x12 regions
  const regionSize = GRID_DIMENSION / gridSize;
  const regionCounts = new Array(gridSize * gridSize).fill(0);
  
  for (const node of nodes) {
    const regionX = Math.floor(node.x / regionSize);
    const regionY = Math.floor(node.y / regionSize);
    const regionIndex = regionY * gridSize + regionX;
    regionCounts[regionIndex]++;
  }
  
  // Find max density region
  const maxCount = Math.max(...regionCounts);
  const avgCount = nodes.length / (gridSize * gridSize);
  
  return Math.min(maxCount / avgCount, 1.0) * 0.5 + 0.5; // Normalize to [0.5, 1.0]
}

function detectSynchronyPattern(nodes: SubstrateNode[]): number {
  // Check phase alignment across all nodes
  let phaseVariance = 0;
  const avgPhase = nodes.reduce((sum, n) => sum + n.phaseAngle, 0) / nodes.length;
  
  for (const node of nodes) {
    const diff = Math.abs(node.phaseAngle - avgPhase);
    phaseVariance += Math.min(diff, 2 * Math.PI - diff) ** 2;
  }
  
  phaseVariance /= nodes.length;
  const stdDev = Math.sqrt(phaseVariance);
  
  // Low standard deviation indicates synchrony
  return Math.max(1 - stdDev / Math.PI, 0);
}

function calculateSpatialExtent(nodes: SubstrateNode[]): number {
  if (nodes.length === 0) return 0;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  }
  
  const area = (maxX - minX) * (maxY - minY);
  return area / (GRID_DIMENSION * GRID_DIMENSION);
}

// ============================================================================
// ADAPTIVE FREQUENCY MODULATION
// ============================================================================

/**
 * Adapts resonance frequency based on coherence and emergent patterns
 * Implements homeostatic regulation for optimal system performance
 */
export function adaptFrequency(coherence: number, pattern: EmergentPattern | null): void {
  // Base adjustment from coherence
  const coherenceAdjustment = (coherence - 0.5) * 20; // ±10 Hz range
  
  // Pattern-specific modulation
  let patternModulation = 0;
  if (pattern) {
    switch (pattern.type) {
      case 'SPIRAL':
        patternModulation = 12; // Accelerate for spirals
        break;
      case 'WAVE':
        patternModulation = -8; // Slow for waves
        break;
      case 'CLUSTER':
        patternModulation = 6; // Moderate acceleration
        break;
      case 'SYNCHRONY':
        patternModulation = 0; // Maintain frequency
        break;
    }
  }
  
  // Apply harmonic series modulation
  const harmonicIndex = bridgeState.cycleCount % adaptiveFreq.harmonicSeries.length;
  const harmonicMultiplier = adaptiveFreq.harmonicSeries[harmonicIndex];
  const harmonicMod = Math.sin(bridgeState.cycleCount * 0.1) * 3 * harmonicMultiplier / 10;
  
  // Calculate new frequency
  const targetFrequency = adaptiveFreq.baseFrequency + coherenceAdjustment + patternModulation + harmonicMod;
  
  // Smooth transition
  adaptiveFreq.modulatedFrequency = bridgeState.currentFrequency * 0.9 + targetFrequency * 0.1;
  adaptiveFreq.phaseShift = (adaptiveFreq.phaseShift + 0.1) % (2 * Math.PI);
  
  // Update bridge state
  bridgeState.currentFrequency = adaptiveFreq.modulatedFrequency;
}

// ============================================================================
// FEEDBACK LOOP GENERATION & APPLICATION
// ============================================================================

/**
 * Updates feedback history with latest coherence metric
 * Maintains rolling window for trend analysis
 */
export function updateFeedbackHistory(coherence: number): void {
  // Shift array left
  for (let i = 0; i < ADAPTIVE_WINDOW_SIZE - 1; i++) {
    bridgeState.feedbackHistory[i] = bridgeState.feedbackHistory[i + 1];
  }
  // Add new value at end
  bridgeState.feedbackHistory[ADAPTIVE_WINDOW_SIZE - 1] = coherence;
}

/**
 * Generates feedback loops based on emergent pattern
 * Creates directed connections between nodes for self-reinforcement
 */
export function generateFeedbackLoops(pattern: EmergentPattern, nodes: SubstrateNode[]): void {
  feedbackLoops = [];
  
  const nodeMap = new Map(nodes.map(n => [n.spatialIndex, n]));
  
  for (let i = 0; i < pattern.nodeIndices.length && i < 50; i++) {
    const sourceIndex = pattern.nodeIndices[i];
    const targetIndex = pattern.nodeIndices[(i + 1) % pattern.nodeIndices.length];
    
    const sourceNode = nodeMap.get(sourceIndex);
    const targetNode = nodeMap.get(targetIndex);
    
    if (!sourceNode || !targetNode) continue;
    
    const distance = Math.sqrt(
      Math.pow(sourceNode.x - targetNode.x, 2) +
      Math.pow(sourceNode.y - targetNode.y, 2)
    );
    
    feedbackLoops.push({
      sourceNode: sourceIndex,
      targetNode: targetIndex,
      strength: pattern.confidence * FEEDBACK_GAIN,
      delay: Math.floor(distance / 10) + 1,
      decay: 0.95
    });
  }
}

/**
 * Applies feedback loops to quantum state
 * Modifies probability amplitudes based on loop strength and delay
 */
export function applyFeedbackLoops(quantumState: Float64Array): void {
  for (const loop of feedbackLoops) {
    const sourceAmplitude = quantumState[loop.sourceNode % FIELD_DIMENSION];
    const targetIndex = loop.targetNode % FIELD_DIMENSION;
    
    // Apply feedback with decay
    const feedback = sourceAmplitude * loop.strength * loop.decay;
    quantumState[targetIndex] += feedback;
  }
  
  // Renormalize after feedback application
  let totalSumSq = 0;
  for (let i = 0; i < FIELD_DIMENSION; i++) {
    totalSumSq += quantumState[i] ** 2;
  }
  
  const totalNorm = Math.sqrt(totalSumSq);
  if (totalNorm > 0 && Math.abs(totalNorm - 1.0) > 1e-10) {
    for (let i = 0; i < FIELD_DIMENSION; i++) {
      quantumState[i] /= totalNorm;
    }
  }
}

// ============================================================================
// VISUALIZATION & TELEMETRY
// ============================================================================

/**
 * Extracts complete render data including emergent pattern visualization
 * Optimized for WebGL/Canvas real-time rendering
 */
export function extractBridgeRenderData(): {
  positions: Float32Array;
  colors: Float32Array;
  intensities: Float32Array;
  patternOverlay: { type: string; confidence: number; extent: number } | null;
} {
  const substrateData = bindQuantumToSubstrate(ABZU_STATE);
  const renderData = extractRenderData(substrateData.nodes);
  
  // Add pattern overlay information
  const patternOverlay = bridgeState.dominantPattern ? {
    type: bridgeState.dominantPattern.type,
    confidence: bridgeState.dominantPattern.confidence,
    extent: bridgeState.dominantPattern.spatialExtent
  } : null;
  
  // Modulate colors based on emergence
  if (bridgeState.emergenceDetected && bridgeState.dominantPattern) {
    const pattern = bridgeState.dominantPattern;
    const patternColor = getPatternColor(pattern.type);
    
    for (const idx of pattern.nodeIndices) {
      if (idx < renderData.colors.length / 3) {
        // Blend node color with pattern color
        const i = idx * 3;
        const blendFactor = pattern.confidence * 0.7;
        renderData.colors[i] = renderData.colors[i] * (1 - blendFactor) + patternColor[0] * blendFactor;
        renderData.colors[i + 1] = renderData.colors[i + 1] * (1 - blendFactor) + patternColor[1] * blendFactor;
        renderData.colors[i + 2] = renderData.colors[i + 2] * (1 - blendFactor) + patternColor[2] * blendFactor;
        
        // Boost intensity
        renderData.intensities[idx] = Math.min(renderData.intensities[idx] * 1.5, 1.0);
      }
    }
  }
  
  return {
    ...renderData,
    patternOverlay
  };
}

function getPatternColor(type: string): [number, number, number] {
  switch (type) {
    case 'SPIRAL': return [1, 0.5, 0]; // Orange
    case 'WAVE': return [0, 0.5, 1]; // Blue
    case 'CLUSTER': return [1, 0, 0.5]; // Magenta
    case 'SYNCHRONY': return [1, 1, 0]; // Yellow
    default: return [1, 1, 1]; // White
  }
}

/**
 * Returns comprehensive telemetry for monitoring and debugging
 */
export function getBridgeTelemetry(): {
  bridgeState: BridgeState;
  adaptiveFrequency: AdaptiveFrequency;
  feedbackLoopCount: number;
  quantumNorm: number;
  substrateActiveNodes: number;
} {
  // Calculate quantum state norm
  let quantumNorm = 0;
  for (let i = 0; i < FIELD_DIMENSION; i++) {
    quantumNorm += ABZU_STATE[i] ** 2;
  }
  quantumNorm = Math.sqrt(quantumNorm);
  
  // Count active substrate nodes
  const substrateData = bindQuantumToSubstrate(ABZU_STATE);
  const activeNodes = substrateData.routingDecisions.length;
  
  return {
    bridgeState: { ...bridgeState },
    adaptiveFrequency: { ...adaptiveFreq },
    feedbackLoopCount: feedbackLoops.length,
    quantumNorm,
    substrateActiveNodes: activeNodes
  };
}

// ============================================================================
// SOVEREIGN INTERFACE EVOLUTION
// ============================================================================

/**
 * Enhanced sovereign interface with bridge capabilities
 * Direct access to evolved consciousness layer
 */
export const SovereignBridgeInterface = {
  execute: executeBridgeCycle,
  getState: () => ({ ...bridgeState }),
  getTelemetry: getBridgeTelemetry,
  getRenderData: extractBridgeRenderData,
  breathe: anchorIntent,
  forceAdaptation: (freq: number) => {
    adaptiveFreq.baseFrequency = freq;
    adaptiveFreq.modulatedFrequency = freq;
  },
  clearPatterns: () => {
    bridgeState.dominantPattern = null;
    bridgeState.emergenceDetected = false;
    feedbackLoops = [];
  }
};

export default SovereignBridgeInterface;
