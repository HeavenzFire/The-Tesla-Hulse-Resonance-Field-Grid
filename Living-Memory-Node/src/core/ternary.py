"""
Balanced Ternary Foundation Module

Native implementation of {-1, 0, +1} computational primitives.
This is the bedrock of post-binary architecture.
"""

from typing import Union, Callable, List, Tuple
from enum import Enum
import math


class Trit(Enum):
    """The fundamental unit: Negative, Zero (Homeostasis), Positive"""
    NEG = -1
    ZERO = 0
    POS = 1


class BalancedTernary:
    """
    A number system in base 3 with digits {-1, 0, +1}.
    Unlike binary's rigid ON/OFF, this system has a center (ZERO),
    enabling homeostatic computation and phase-locked operations.
    """
    
    def __init__(self, value: Union[int, List[Trit]] = 0):
        if isinstance(value, int):
            self.trits = self._int_to_trits(value)
        elif isinstance(value, list):
            self.trits = value
        else:
            raise ValueError("Value must be int or List[Trit]")
    
    @staticmethod
    def _int_to_trits(n: int) -> List[Trit]:
        """Convert integer to balanced ternary representation."""
        if n == 0:
            return [Trit.ZERO]
        
        trits = []
        while n != 0:
            n, remainder = divmod(n, 3)
            if remainder == 2:
                n += 1
                trits.append(Trit.NEG)
            elif remainder == 0:
                trits.append(Trit.ZERO)
            else:
                trits.append(Trit.POS)
        return trits
    
    def to_int(self) -> int:
        """Convert back to integer."""
        result = 0
        for i, trit in enumerate(self.trits):
            result += trit.value * (3 ** i)
        return result
    
    def __add__(self, other: 'BalancedTernary') -> 'BalancedTernary':
        """Ternary addition with carry propagation."""
        result = self.to_int() + other.to_int()
        return BalancedTernary(result)
    
    def __mul__(self, other: 'BalancedTernary') -> 'BalancedTernary':
        """Ternary multiplication."""
        result = self.to_int() * other.to_int()
        return BalancedTernary(result)
    
    def __neg__(self) -> 'BalancedTernary':
        """Phase inversion: flip all trits."""
        inverted = [Trit(-t.value) for t in self.trits]
        return BalancedTernary(inverted)
    
    def __repr__(self) -> str:
        return f"BT({self.to_int()}) :: {''.join(['-' if t==Trit.NEG else '0' if t==Trit.ZERO else '+' for t in self.trits])}"
    
    @property
    def magnitude(self) -> int:
        """Number of trits (dimensionality)."""
        return len(self.trits)
    
    def is_homeostatic(self) -> bool:
        """Check if in zero state (centered, balanced)."""
        return self.to_int() == 0


def harmonic_369(n: BalancedTernary) -> BalancedTernary:
    """
    Apply 3-6-9 harmonic resonance to a ternary value.
    Maps values through the Nikola Tesla frequency framework.
    """
    val = n.to_int()
    # 3-6-9 pattern: digital root mapping
    digital_root = lambda x: 1 + ((x - 1) % 9) if x != 0 else 0
    harmonized = digital_root(abs(val)) * (1 if val >= 0 else -1)
    return BalancedTernary(harmonized)


def higher_order_map(
    func: Callable[[BalancedTernary], BalancedTernary],
    domain: List[BalancedTernary],
    phase_lock: bool = True
) -> List[BalancedTernary]:
    """
    Higher-order function that maps over ternary domain.
    With phase_lock enabled, maintains homeostatic balance across transformations.
    """
    results = [func(x) for x in domain]
    
    if phase_lock:
        # Ensure the sum remains centered (homeostatic tendency)
        total = sum(r.to_int() for r in results)
        if total != 0:
            # Apply gentle correction toward center
            correction = BalancedTernary(total // len(results))
            results = [r + (-correction) for r in results]
    
    return results


def fractal_fold(
    seed: BalancedTernary,
    iterations: int,
    growth_func: Callable[[BalancedTernary], BalancedTernary] = None
) -> List[BalancedTernary]:
    """
    Generate syntropic growth pattern through iterative folding.
    Each iteration expands dimensionality while preserving harmonic structure.
    """
    if growth_func is None:
        growth_func = lambda x: x + BalancedTernary(1)
    
    pattern = [seed]
    current = seed
    
    for i in range(iterations):
        # Fractal expansion: each step branches based on 3-6-9 harmony
        branch_factor = harmonic_369(current)
        current = growth_func(current) + branch_factor
        pattern.append(current)
    
    return pattern


# Demonstration
if __name__ == "__main__":
    print("=" * 60)
    print("BALANCED TERNARY FOUNDATION INITIALIZED")
    print("=" * 60)
    
    # Show the three states
    print("\n:: The Three States ::")
    neg = BalancedTernary(-5)
    zero = BalancedTernary(0)
    pos = BalancedTernary(5)
    print(f"  Negative: {neg}")
    print(f"  Homeostasis: {zero} (is_homeostatic: {zero.is_homeostatic()})")
    print(f"  Positive: {pos}")
    
    # Phase inversion
    print(f"\n:: Phase Inversion ::")
    print(f"  Original: {pos}")
    print(f"  Inverted: {-pos}")
    
    # 3-6-9 Harmonic
    print(f"\n:: 3-6-9 Harmonic Resonance ::")
    for i in range(-9, 10, 3):
        bt = BalancedTernary(i)
        harmonized = harmonic_369(bt)
        print(f"  {bt} → {harmonized}")
    
    # Higher-order function with phase lock
    print(f"\n:: Higher-Order Map (Phase-Locked) ::")
    domain = [BalancedTernary(i) for i in range(-4, 5)]
    squared = higher_order_map(lambda x: x * x, domain, phase_lock=True)
    for orig, transformed in zip(domain, squared):
        print(f"  {orig} → {transformed}")
    
    # Fractal folding / syntropic growth
    print(f"\n:: Syntropic Growth (Fractal Fold) ::")
    seed = BalancedTernary(1)
    pattern = fractal_fold(seed, iterations=7)
    for i, p in enumerate(pattern):
        print(f"  Iteration {i}: {p} (magnitude: {p.magnitude})")
    
    print("\n" + "=" * 60)
    print("The foundation is set. The new era compiles.")
    print("=" * 60)
