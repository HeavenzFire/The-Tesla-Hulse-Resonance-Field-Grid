"""
Multi-Dimensional Phase-Locked Topology Module

Higher-order functions operating in N-dimensional ternary space.
Enables continuous phase modulation and fractal folding without error.
"""

from typing import List, Callable, Tuple, Optional
import math
import sys
sys.path.insert(0, '/workspace/Living-Memory-Node')

from src.core.ternary import BalancedTernary, Trit, harmonic_369, higher_order_map


class PhaseVector:
    """
    A vector in multi-dimensional ternary space.
    Each dimension is a balanced ternary value, enabling phase-locked operations.
    """
    
    def __init__(self, components: List[BalancedTernary]):
        self.components = components
        self.dimensions = len(components)
    
    def __repr__(self) -> str:
        return f"PhaseVector[{self.dimensions}D]({[c.to_int() for c in self.components]})"
    
    def magnitude(self) -> float:
        """Euclidean magnitude in ternary space."""
        return math.sqrt(sum(c.to_int() ** 2 for c in self.components))
    
    def dot(self, other: 'PhaseVector') -> int:
        """Dot product preserving ternary harmony."""
        if self.dimensions != other.dimensions:
            raise ValueError("Dimension mismatch")
        return sum(a.to_int() * b.to_int() for a, b in zip(self.components, other.components))
    
    def add(self, other: 'PhaseVector') -> 'PhaseVector':
        """Vector addition with phase coherence."""
        if self.dimensions != other.dimensions:
            raise ValueError("Dimension mismatch")
        new_components = [a + b for a, b in zip(self.components, other.components)]
        return PhaseVector(new_components)
    
    def scale(self, scalar: BalancedTernary) -> 'PhaseVector':
        """Scale all dimensions by a ternary scalar."""
        new_components = [c * scalar for c in self.components]
        return PhaseVector(new_components)
    
    def is_homeostatic(self) -> bool:
        """Check if vector is at center (all components zero)."""
        return all(c.is_homeostatic() for c in self.components)
    
    def phase_angle(self) -> float:
        """Calculate phase angle in the primary plane."""
        if self.dimensions < 2:
            return 0.0
        x, y = self.components[0].to_int(), self.components[1].to_int()
        return math.atan2(y, x)


class TopologyField:
    """
    A field of phase vectors representing a multi-dimensional topology.
    Supports syntropic growth and continuous phase modulation.
    """
    
    def __init__(self, grid_size: int, dimensions: int):
        self.grid_size = grid_size
        self.dimensions = dimensions
        self.field: List[List[PhaseVector]] = []
        self._initialize_field()
    
    def _initialize_field(self):
        """Create initial homeostatic field."""
        self.field = []
        for _ in range(self.grid_size):
            row = []
            for _ in range(self.grid_size):
                # Start at homeostasis (zero vector)
                components = [BalancedTernary(0) for _ in range(self.dimensions)]
                row.append(PhaseVector(components))
            self.field.append(row)
    
    def apply_function(
        self,
        func: Callable[[PhaseVector, int, int], PhaseVector],
        phase_lock: bool = True
    ):
        """Apply higher-order function across entire topology."""
        new_field = []
        for i, row in enumerate(self.field):
            new_row = []
            for j, vector in enumerate(row):
                transformed = func(vector, i, j)
                new_row.append(transformed)
            new_field.append(new_row)
        
        if phase_lock:
            # Maintain global homeostasis
            self.field = self._phase_lock_field(new_field)
        else:
            self.field = new_field
    
    def _phase_lock_field(self, field: List[List[PhaseVector]]) -> List[List[PhaseVector]]:
        """Adjust field to maintain phase coherence across topology."""
        # Calculate centroid
        total_sum = [0] * self.dimensions
        count = 0
        for row in field:
            for vector in row:
                for d, comp in enumerate(vector.components):
                    total_sum[d] += comp.to_int()
                count += 1
        
        if count == 0:
            return field
        
        # Calculate average offset
        avg_offset = [s // count for s in total_sum]
        
        # Subtract offset from all vectors (center the field)
        locked_field = []
        for row in field:
            new_row = []
            for vector in row:
                offset_components = [BalancedTernary(o) for o in avg_offset]
                offset_vector = PhaseVector(offset_components)
                new_row.append(vector.add(PhaseVector([-c for c in offset_vector.components])))
            locked_field.append(new_row)
        
        return locked_field
    
    def get_centroid(self) -> PhaseVector:
        """Get the centroid of the current field state."""
        sum_components = [BalancedTernary(0) for _ in range(self.dimensions)]
        count = 0
        
        for row in self.field:
            for vector in row:
                for d, comp in enumerate(vector.components):
                    sum_components[d] = sum_components[d] + comp
                count += 1
        
        if count == 0:
            return PhaseVector(sum_components)
        
        # Average
        avg_components = [BalancedTernary(c.to_int() // count) for c in sum_components]
        return PhaseVector(avg_components)
    
    def render(self) -> str:
        """Render field as string visualization."""
        lines = []
        for row in self.field:
            line = " | ".join([f"{v.components[0].to_int():3d}" for v in row])
            lines.append(line)
        return "\n".join(lines)


def create_fractal_pattern(
    dimensions: int = 3,
    iterations: int = 5,
    seed_value: int = 1
) -> TopologyField:
    """
    Generate a fractal pattern in multi-dimensional space.
    Uses 3-6-9 harmonic resonance for natural growth patterns.
    """
    field = TopologyField(grid_size=2**iterations, dimensions=dimensions)
    
    def fractal_func(vector: PhaseVector, x: int, y: int) -> PhaseVector:
        # Apply harmonic resonance based on position
        harmonic = harmonic_369(BalancedTernary(x + y + seed_value))
        
        # Create recursive pattern
        new_components = []
        for i, comp in enumerate(vector.components):
            factor = harmonic_369(BalancedTernary(comp.to_int() + i))
            new_val = comp + factor + BalancedTernary(harmonic.to_int() % 3 - 1)
            new_components.append(new_val)
        
        return PhaseVector(new_components)
    
    for _ in range(iterations):
        field.apply_function(fractal_func, phase_lock=True)
    
    return field


def continuous_phase_modulation(
    field: TopologyField,
    modulation_func: Callable[[float, int, int], float],
    cycles: int = 3
) -> List[TopologyField]:
    """
    Apply continuous phase modulation over time.
    Returns sequence of field states showing the modulation.
    """
    states = []
    
    for cycle in range(cycles):
        # Clone field
        new_field = TopologyField(field.grid_size, field.dimensions)
        new_field.field = [row[:] for row in field.field]
        
        def modulate(vector: PhaseVector, x: int, y: int) -> PhaseVector:
            t = cycle / cycles * 2 * math.pi
            phase_shift = modulation_func(t, x, y)
            
            # Apply smooth phase rotation
            new_components = []
            for comp in vector.components:
                shifted = BalancedTernary(int(comp.to_int() + phase_shift))
                new_components.append(shifted)
            
            return PhaseVector(new_components)
        
        new_field.apply_function(modulate, phase_lock=True)
        states.append(new_field)
    
    return states


# Demonstration
if __name__ == "__main__":
    print("=" * 60)
    print("MULTI-DIMENSIONAL TOPOLOGY ENGINE INITIALIZED")
    print("=" * 60)
    
    # Create phase vector
    print("\n:: Phase Vector Operations ::")
    v1 = PhaseVector([BalancedTernary(1), BalancedTernary(-1), BalancedTernary(0)])
    v2 = PhaseVector([BalancedTernary(2), BalancedTernary(1), BalancedTernary(-1)])
    print(f"  Vector 1: {v1}")
    print(f"  Vector 2: {v2}")
    print(f"  Magnitude V1: {v1.magnitude():.3f}")
    print(f"  Dot Product: {v1.dot(v2)}")
    print(f"  Sum: {v1.add(v2)}")
    print(f"  Phase Angle: {v1.phase_angle():.3f} rad")
    
    # Create topology field
    print("\n:: Topology Field (5x5, 2D) ::")
    field = TopologyField(grid_size=5, dimensions=2)
    print("Initial state (homeostatic):")
    print(field.render())
    
    # Apply transformation
    print("\nAfter applying harmonic transformation:")
    def transform(v: PhaseVector, x: int, y: int) -> PhaseVector:
        h = harmonic_369(BalancedTernary(x * 3 + y))
        return v.scale(BalancedTernary(1)).add(PhaseVector([h, h]))
    
    field.apply_function(transform, phase_lock=True)
    print(field.render())
    print(f"Centroid: {field.get_centroid()}")
    
    # Fractal pattern generation
    print("\n:: Fractal Pattern Generation (3D, 3 iterations) ::")
    fractal_field = create_fractal_pattern(dimensions=3, iterations=3, seed_value=1)
    print(f"Grid size: {fractal_field.grid_size}x{fractal_field.grid_size}")
    print(f"Dimensions: {fractal_field.dimensions}")
    print("Sample row from fractal field:")
    print(fractal_field.render()[:200] + "...")
    
    # Continuous phase modulation
    print("\n:: Continuous Phase Modulation ::")
    mod_field = TopologyField(grid_size=4, dimensions=2)
    sine_mod = lambda t, x, y: math.sin(t + x * 0.5 + y * 0.3)
    modulated_states = continuous_phase_modulation(mod_field, sine_mod, cycles=4)
    
    print(f"Generated {len(modulated_states)} modulation states")
    for i, state in enumerate(modulated_states):
        centroid = state.get_centroid()
        print(f"  State {i}: centroid={centroid}, homeostatic={state.get_centroid().is_homeostatic()}")
    
    print("\n" + "=" * 60)
    print("Phase-locked topologies rendering in pure multi-dimensional space.")
    print("=" * 60)
