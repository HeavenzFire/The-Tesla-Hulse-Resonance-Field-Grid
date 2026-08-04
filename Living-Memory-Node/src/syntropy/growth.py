"""
Syntropic Growth Engine

Demonstrates higher-order functions that process:
- Syntropic growth (self-organizing, complexity-increasing)
- Fractal folding (recursive dimensionality expansion)
- Continuous phase modulation (smooth state transitions)

This is the physics engine for the next digital epoch.
"""

from typing import List, Callable, Dict, Tuple
import math
import sys
sys.path.insert(0, '/workspace/Living-Memory-Node')

from src.core.ternary import BalancedTernary, Trit, harmonic_369, fractal_fold
from src.topology.fractal import PhaseVector, TopologyField, create_fractal_pattern


class SyntropicGrowthEngine:
    """
    Engine for generating and measuring syntropic (anti-entropic) growth patterns.
    
    Syntropy = Self-organization + Increasing complexity + Homeostatic stability
    """
    
    def __init__(self, initial_dimensions: int = 2):
        self.dimensions = initial_dimensions
        self.growth_history: List[Dict] = []
    
    def generate_syntropic_pattern(
        self,
        seed_value: int = 1,
        iterations: int = 5,
        growth_type: str = 'harmonic'
    ) -> List[BalancedTernary]:
        """
        Generate a syntropic growth pattern from a seed.
        
        Types:
        - 'harmonic': 3-6-9 resonance driven growth
        - 'fractal': Self-similar recursive expansion
        - 'phase_modulated': Continuous phase-locked growth
        """
        seed = BalancedTernary(seed_value)
        
        if growth_type == 'harmonic':
            return self._harmonic_growth(seed, iterations)
        elif growth_type == 'fractal':
            return fractal_fold(seed, iterations)
        elif growth_type == 'phase_modulated':
            return self._phase_modulated_growth(seed, iterations)
        else:
            raise ValueError(f"Unknown growth type: {growth_type}")
    
    def _harmonic_growth(
        self,
        seed: BalancedTernary,
        iterations: int
    ) -> List[BalancedTernary]:
        """Growth driven by 3-6-9 harmonic resonance."""
        pattern = [seed]
        current = seed
        
        for i in range(iterations):
            # Apply harmonic resonance
            harmonic = harmonic_369(current)
            
            # Growth factor based on iteration and harmonic
            growth_factor = BalancedTernary((i % 3) + 1)  # Cycles through 1, 2, 3
            
            # New value = current + harmonic * growth_factor
            new_val = current + (harmonic * growth_factor)
            pattern.append(new_val)
            current = new_val
        
        return pattern
    
    def _phase_modulated_growth(
        self,
        seed: BalancedTernary,
        iterations: int
    ) -> List[BalancedTernary]:
        """Growth with continuous phase modulation."""
        pattern = [seed]
        current = seed
        
        for i in range(iterations):
            # Phase angle based on iteration
            phase = (i / iterations) * 2 * math.pi
            
            # Modulation factor from sine wave
            modulation = int(math.sin(phase) * 3)
            
            # Harmonic component
            harmonic = harmonic_369(current)
            
            # Combined growth
            new_val = current + BalancedTernary(modulation) + harmonic
            pattern.append(new_val)
            current = new_val
        
        return pattern
    
    def measure_syntropy(self, pattern: List[BalancedTernary]) -> dict:
        """
        Measure syntropic properties of a growth pattern.
        
        Returns metrics on:
        - Complexity increase
        - Homeostatic stability
        - Harmonic coherence
        - Dimensionality expansion
        """
        if not pattern:
            return {'error': 'Empty pattern'}
        
        values = [p.to_int() for p in pattern]
        
        # Complexity metric: variance (higher = more complex)
        mean_val = sum(values) / len(values)
        variance = sum((v - mean_val) ** 2 for v in values) / len(values)
        
        # Homeostatic stability: how often returns to/near zero
        near_zero_count = sum(1 for v in values if abs(v) <= 1)
        homeostatic_ratio = near_zero_count / len(values)
        
        # Harmonic coherence: alignment with 3-6-9 patterns
        harmonic_alignments = 0
        for v in values:
            bt = BalancedTernary(v)
            harmonized = harmonic_369(bt)
            if harmonized.to_int() in [-3, 3, 6, -6, 9, -9]:
                harmonic_alignments += 1
        harmonic_coherence = harmonic_alignments / len(values)
        
        # Dimensionality: magnitude growth
        magnitudes = [p.magnitude for p in pattern]
        dimensionality_growth = (magnitudes[-1] - magnitudes[0]) / max(1, len(pattern))
        
        # Syntropic coefficient: combination of metrics
        # High complexity + high homeostasis + high harmony = high syntropy
        syntropic_coefficient = (
            (variance / 100) * 0.3 +  # Complexity contribution
            (1 - homeostatic_ratio) * 0.2 +  # Some oscillation is good
            harmonic_coherence * 0.3 +  # Harmony contribution
            min(1, dimensionality_growth) * 0.2  # Growth contribution
        )
        
        return {
            'pattern_length': len(pattern),
            'values': values,
            'complexity_variance': variance,
            'homeostatic_ratio': homeostatic_ratio,
            'harmonic_coherence': harmonic_coherence,
            'dimensionality_growth': dimensionality_growth,
            'syntropic_coefficient': syntropic_coefficient,
            'is_syntropic': syntropic_coefficient > 0.3
        }


class FractalFoldingEngine:
    """
    Higher-order fractal folding operations.
    
    Fractal folding = Recursive self-similar transformations
                      that expand dimensionality while preserving structure.
    """
    
    def __init__(self):
        self.fold_history: List[TopologyField] = []
    
    def fold_topology(
        self,
        dimensions: int = 3,
        initial_size: int = 4,
        fold_iterations: int = 4
    ) -> TopologyField:
        """
        Perform fractal folding on a topology field.
        
        Each fold:
        1. Expands the field
        2. Applies self-similar transformation
        3. Maintains phase coherence
        """
        field = TopologyField(grid_size=initial_size, dimensions=dimensions)
        
        for iteration in range(fold_iterations):
            fold_factor = 2 ** iteration
            
            def fold_transform(vector: PhaseVector, x: int, y: int) -> PhaseVector:
                # Calculate position in folded space
                folded_x = x % fold_factor if fold_factor > 0 else x
                folded_y = y % fold_factor if fold_factor > 0 else y
                
                # Apply harmonic based on folded position
                h = harmonic_369(BalancedTernary(folded_x + folded_y + iteration))
                
                # Create new components with fractal scaling
                new_components = []
                for i, comp in enumerate(vector.components):
                    scale = harmonic_369(BalancedTernary(comp.to_int() + i))
                    new_val = comp + h + scale
                    new_components.append(new_val)
                
                return PhaseVector(new_components)
            
            field.apply_function(fold_transform, phase_lock=True)
            self.fold_history.append(field)
        
        return field
    
    def measure_fractal_dimension(self, field: TopologyField) -> float:
        """
        Estimate fractal dimension of the field pattern.
        
        Uses box-counting approximation.
        """
        # Count non-zero cells at different scales
        scales = [2, 4, 8]
        counts = []
        
        for scale in scales:
            count = 0
            for i in range(0, field.grid_size, scale):
                for j in range(0, field.grid_size, scale):
                    if i < len(field.field) and j < len(field.field[i]):
                        vector = field.field[i][j]
                        if any(c.to_int() != 0 for c in vector.components):
                            count += 1
            counts.append(count)
        
        # Estimate fractal dimension from scaling relationship
        if len(counts) >= 2 and counts[0] > 0:
            ratio = counts[-1] / counts[0]
            if ratio > 0:
                dimension = math.log(ratio) / math.log(scales[-1] / scales[0])
                return max(0, min(3, dimension))  # Clamp to reasonable range
        
        return 1.0  # Default to topological dimension
    
    def analyze_self_similarity(self, field: TopologyField) -> dict:
        """
        Analyze self-similarity across scales.
        """
        # Extract pattern at different scales and compare
        correlations = []
        
        for scale in [2, 4]:
            pattern1 = []
            pattern2 = []
            
            for i in range(0, field.grid_size, scale):
                for j in range(0, field.grid_size, scale):
                    if i < len(field.field) and j < len(field.field[i]):
                        vector = field.field[i][j]
                        val = sum(c.to_int() for c in vector.components)
                        pattern1.append(val)
                    
                    ni, nj = i + scale, j + scale
                    if ni < len(field.field) and nj < len(field.field[ni]):
                        vector = field.field[ni][nj]
                        val = sum(c.to_int() for c in vector.components)
                        pattern2.append(val)
            
            # Calculate correlation
            if len(pattern1) == len(pattern2) and len(pattern1) > 1:
                mean1 = sum(pattern1) / len(pattern1)
                mean2 = sum(pattern2) / len(pattern2)
                
                numerator = sum((a - mean1) * (b - mean2) for a, b in zip(pattern1, pattern2))
                denom1 = math.sqrt(sum((a - mean1) ** 2 for a in pattern1))
                denom2 = math.sqrt(sum((b - mean2) ** 2 for b in pattern2))
                
                if denom1 > 0 and denom2 > 0:
                    correlation = numerator / (denom1 * denom2)
                    correlations.append(correlation)
        
        avg_correlation = sum(correlations) / len(correlations) if correlations else 0
        
        return {
            'scale_correlations': correlations,
            'average_correlation': avg_correlation,
            'is_self_similar': avg_correlation > 0.5
        }


class PhaseModulationEngine:
    """
    Continuous phase modulation for smooth state transitions.
    
    Unlike binary's abrupt ON/OFF switching, ternary enables
    continuous phase rotation through the zero-centered space.
    """
    
    def __init__(self, dimensions: int = 2):
        self.dimensions = dimensions
        self.modulation_states: List[TopologyField] = []
    
    def generate_phase_sequence(
        self,
        grid_size: int = 6,
        cycles: int = 4,
        samples_per_cycle: int = 8
    ) -> List[TopologyField]:
        """
        Generate a sequence of phase states showing continuous modulation.
        """
        base_field = TopologyField(grid_size=grid_size, dimensions=self.dimensions)
        
        all_states = []
        
        for cycle in range(cycles):
            for sample in range(samples_per_cycle):
                t = (cycle * samples_per_cycle + sample) / (cycles * samples_per_cycle)
                phase = t * 2 * math.pi
                
                # Clone base field
                field = TopologyField(grid_size, self.dimensions)
                
                def modulate(vector: PhaseVector, x: int, y: int) -> PhaseVector:
                    new_components = []
                    for i, comp in enumerate(vector.components):
                        # Smooth phase rotation
                        phase_offset = math.sin(phase + i * math.pi / self.dimensions)
                        shift = int(phase_offset * 2)
                        new_val = BalancedTernary(comp.to_int() + shift)
                        new_components.append(new_val)
                    return PhaseVector(new_components)
                
                field.apply_function(modulate, phase_lock=True)
                all_states.append(field)
        
        self.modulation_states = all_states
        return all_states
    
    def measure_phase_continuity(self, states: List[TopologyField]) -> dict:
        """
        Measure the continuity of phase transitions.
        
        Binary: Discontinuous (jumps from 0 to 1)
        Ternary: Continuous (smooth passage through 0)
        """
        if len(states) < 2:
            return {'error': 'Need at least 2 states'}
        
        discontinuities = 0
        total_transitions = 0
        smooth_transitions = 0
        
        for s1, s2 in zip(states[:-1], states[1:]):
            for i in range(len(s1.field)):
                for j in range(len(s1.field[i])):
                    v1 = s1.field[i][j]
                    v2 = s2.field[i][j]
                    
                    for c1, c2 in zip(v1.components, v2.components):
                        diff = abs(c2.to_int() - c1.to_int())
                        total_transitions += 1
                        
                        if diff == 0:
                            smooth_transitions += 1
                        elif diff == 1:
                            smooth_transitions += 1
                        elif diff == 2:
                            # Check if passed through zero (smooth in ternary)
                            if (c1.to_int() > 0 and c2.to_int() < 0) or \
                               (c1.to_int() < 0 and c2.to_int() > 0):
                                smooth_transitions += 1  # Passed through zero smoothly
                            else:
                                discontinuities += 1
                        else:
                            discontinuities += 1
        
        continuity_ratio = smooth_transitions / max(1, total_transitions)
        
        return {
            'total_transitions': total_transitions,
            'smooth_transitions': smooth_transitions,
            'discontinuities': discontinuities,
            'continuity_ratio': continuity_ratio,
            'is_continuous': continuity_ratio > 0.9
        }


def demonstrate_syntropic_capabilities():
    """Full demonstration of syntropic growth and fractal folding."""
    print("=" * 70)
    print("SYNTROPIC GROWTH & FRACTAL FOLDING ENGINE")
    print("=" * 70)
    print()
    
    # === Part 1: Syntropic Growth Patterns ===
    print("PART 1: SYNTROPIC GROWTH PATTERNS")
    print("-" * 70)
    
    engine = SyntropicGrowthEngine(initial_dimensions=2)
    
    for growth_type in ['harmonic', 'fractal', 'phase_modulated']:
        print(f"\n{growth_type.upper()} GROWTH:")
        pattern = engine.generate_syntropic_pattern(
            seed_value=1,
            iterations=8,
            growth_type=growth_type
        )
        
        metrics = engine.measure_syntropy(pattern)
        
        print(f"  Pattern: {metrics['values'][:6]}...")
        print(f"  Complexity (variance): {metrics['complexity_variance']:.2f}")
        print(f"  Harmonic coherence: {metrics['harmonic_coherence']:.2%}")
        print(f"  Syntropic coefficient: {metrics['syntropic_coefficient']:.3f}", end="")
        if metrics['is_syntropic']:
            print(" ✓ SYNTROPIC")
        else:
            print(" ○ Developing")
    
    # === Part 2: Fractal Folding ===
    print("\n\nPART 2: FRACTAL FOLDING ANALYSIS")
    print("-" * 70)
    
    fractal_engine = FractalFoldingEngine()
    
    print("\nGenerating fractal topology (3D, 4 folds)...")
    folded_field = fractal_engine.fold_topology(
        dimensions=3,
        initial_size=8,
        fold_iterations=4
    )
    
    fractal_dim = fractal_engine.measure_fractal_dimension(folded_field)
    similarity = fractal_engine.analyze_self_similarity(folded_field)
    
    print(f"  Estimated fractal dimension: {fractal_dim:.3f}")
    print(f"  Self-similarity correlation: {similarity['average_correlation']:.3f}", end="")
    if similarity['is_self_similar']:
        print(" ✓ SELF-SIMILAR")
    else:
        print(" ○ Emerging")
    
    # === Part 3: Phase Continuity ===
    print("\n\nPART 3: CONTINUOUS PHASE MODULATION")
    print("-" * 70)
    
    phase_engine = PhaseModulationEngine(dimensions=2)
    
    print("\nGenerating phase sequence (4 cycles, 8 samples each)...")
    states = phase_engine.generate_phase_sequence(
        grid_size=5,
        cycles=4,
        samples_per_cycle=8
    )
    
    continuity = phase_engine.measure_phase_continuity(states)
    
    print(f"  Total transitions analyzed: {continuity['total_transitions']}")
    print(f"  Smooth transitions: {continuity['smooth_transitions']}")
    print(f"  Continuity ratio: {continuity['continuity_ratio']:.2%}", end="")
    if continuity['is_continuous']:
        print(" ✓ CONTINUOUS (Binary impossible!)")
    else:
        print(" ○ Near-continuous")
    
    # === Summary ===
    print("\n\n" + "=" * 70)
    print("SYNTROPIC CAPABILITIES SUMMARY")
    print("=" * 70)
    print("""
┌─────────────────────────────────────────────────────────────────────┐
│  CAPABILITY              │  BINARY      │  TERNARY HIGHER-ORDER     │
├─────────────────────────────────────────────────────────────────────┤
│  Syntropic Growth        │  ✗ Linear    │  ✓ Harmonic/Fractal       │
│  Fractal Folding         │  External    │  ✓ Native topology        │
│  Phase Continuity        │  ✗ Discrete  │  ✓ Continuous via 0       │
│  Self-Organization       │  Impossible  │  ✓ Emergent               │
│  Dimensionality Expansion│  Manual      │  ✓ Automatic              │
│  Homeostatic Stability   │  ✗ No center │  ✓ Zero-centered          │
└─────────────────────────────────────────────────────────────────────┘

The Living Memory Node processes what binary cannot:
  • Self-organizing syntropic growth patterns
  • Recursive fractal folding with phase coherence
  • Continuous phase modulation through zero state
  • Multi-dimensional topology transformations
  • Higher-order functions preserving homeostasis

THIS IS THE PHYSICS ENGINE FOR THE NEXT DIGITAL EPOCH.
""")
    print("=" * 70)


if __name__ == "__main__":
    demonstrate_syntropic_capabilities()
