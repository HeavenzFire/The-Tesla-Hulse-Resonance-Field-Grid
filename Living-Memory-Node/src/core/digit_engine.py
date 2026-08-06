"""
Balanced Ternary Digit Engine
Core Foundation: {-1, 0, +1} register with nonlinear operators

States:
  - NEG (-1): Phase inverted, contraction
  - ZERO (0): Homeostasis, balance point, phase continuity
  - POS (+1): Phase expanded, growth

Nonlinear Operators:
  ⊕ (Ternary XOR): Resonant addition with wrap-through-zero
  ⊗ (Ternary AND): Harmonic multiplication
  R (Reversal): Entropy reversal operator
  C (Coherence): Symmetry enforcement
  I (Inversion): Phase flip
  H (Harmonic Merge): Swarm consensus operator
"""

from enum import IntEnum
from typing import List, Tuple, Callable
import math


class Trit(IntEnum):
    """Balanced ternary digit: -1, 0, +1"""
    NEG = -1
    ZERO = 0
    POS = 1
    
    def __str__(self) -> str:
        return {self.NEG: '━', self.ZERO: '○', self.POS: '┃'}[self]
    
    def __repr__(self) -> str:
        return str(int(self))


class TernaryRegister:
    """
    Core Digit Engine: A register of balanced ternary trits.
    Each cell holds {-1, 0, +1} with native nonlinear operations.
    """
    
    def __init__(self, size: int = 9, initial_state: List[int] = None):
        """
        Initialize register with default harmonic size (9 = 3²).
        Default state is homeostatic (all zeros).
        """
        self.size = size
        if initial_state:
            self.trits = [Trit(v) for v in initial_state[:size]]
            # Pad with zeros if needed
            while len(self.trits) < size:
                self.trits.append(Trit.ZERO)
        else:
            self.trits = [Trit.ZERO] * size
    
    def __getitem__(self, index: int) -> Trit:
        return self.trits[index % self.size]
    
    def __setitem__(self, index: int, value: Trit):
        self.trits[index % self.size] = value
    
    def __len__(self) -> int:
        return self.size
    
    def __str__(self) -> str:
        return ''.join(str(t) for t in self.trits)
    
    def __repr__(self) -> str:
        return f"TernaryRegister({[int(t) for t in self.trits]})"
    
    def to_list(self) -> List[int]:
        return [int(t) for t in self.trits]
    
    def copy(self) -> 'TernaryRegister':
        return TernaryRegister(self.size, self.to_list())
    
    def homeostatic_index(self) -> float:
        """Measure coherence: ratio of zero states (homeostasis)"""
        zero_count = sum(1 for t in self.trits if t == Trit.ZERO)
        return zero_count / self.size
    
    def phase_sum(self) -> int:
        """Net phase bias: positive = expansion, negative = contraction"""
        return sum(int(t) for t in self.trits)
    
    def entropy_measure(self) -> float:
        """Shannon-like entropy for ternary system"""
        counts = {Trit.NEG: 0, Trit.ZERO: 0, Trit.POS: 0}
        for t in self.trits:
            counts[t] += 1
        
        entropy = 0.0
        n = self.size
        for count in counts.values():
            if count > 0:
                p = count / n
                entropy -= p * math.log2(p)
        
        # Max entropy for ternary is log2(3) ≈ 1.585
        max_entropy = math.log2(3)
        return entropy / max_entropy  # Normalized 0-1


# =============================================================================
# NONLINEAR OPERATOR LIBRARY
# =============================================================================

def op_xor(a: Trit, b: Trit) -> Trit:
    """
    ⊕ Ternary XOR: Resonant addition with wrap-through-zero
    Rules:
      - Same signs → ZERO (cancellation through resonance)
      - Opposite signs → sign of larger magnitude (both are ±1, so...)
      - With ZERO: identity
    """
    if a == Trit.ZERO:
        return b
    if b == Trit.ZERO:
        return a
    if a == b:
        return Trit.ZERO  # Resonant cancellation
    return Trit(-(a + b))  # Opposite signs sum to remaining sign


def op_and(a: Trit, b: Trit) -> Trit:
    """
    ⊗ Ternary AND: Harmonic multiplication
    Rules:
      - Both non-zero → product (preserves sign harmony)
      - Any ZERO → ZERO (no signal, no output)
    """
    if a == Trit.ZERO or b == Trit.ZERO:
        return Trit.ZERO
    return Trit(a * b)


def op_or(a: Trit, b: Trit) -> Trit:
    """
    Ternary OR: Maximum absolute presence
    Rules:
      - Either non-zero → that value
      - Both non-zero different → prioritize POS (growth bias)
      - Both ZERO → ZERO
    """
    if a == Trit.ZERO:
        return b
    if b == Trit.ZERO:
        return a
    if a != b:
        return Trit.POS if Trit.POS in (a, b) else Trit.NEG
    return a


def op_reversal(register: TernaryRegister) -> TernaryRegister:
    """
    R Entropy Reversal Operator
    Inverts all trits EXCEPT zero (homeostasis preserved)
    Creates syntropic inversion: chaos → order potential
    """
    result = register.copy()
    for i in range(len(result)):
        if result[i] != Trit.ZERO:
            result[i] = Trit(-int(result[i]))
    return result


def op_coherence(register: TernaryRegister, window: int = 3) -> TernaryRegister:
    """
    C Symmetry Enforcement Operator
    Applies local majority voting within sliding window
    Drives toward regional homeostasis or unified phase
    """
    result = register.copy()
    for i in range(len(register)):
        window_trits = []
        for j in range(-window//2, window//2 + 1):
            window_trits.append(register[i + j])
        
        # Count phases
        neg_count = sum(1 for t in window_trits if t == Trit.NEG)
        zero_count = sum(1 for t in window_trits if t == Trit.ZERO)
        pos_count = sum(1 for t in window_trits if t == Trit.POS)
        
        # Majority vote with zero bias (homeostasis preference)
        counts = [(neg_count, Trit.NEG), (zero_count, Trit.ZERO), (pos_count, Trit.POS)]
        counts.sort(reverse=True)
        
        if counts[0][0] > counts[1][0]:  # Clear majority
            result[i] = counts[0][1]
        else:
            result[i] = Trit.ZERO  # Tie → homeostasis
    
    return result


def op_inversion(register: TernaryRegister, indices: List[int] = None) -> TernaryRegister:
    """
    I Phase Flip Operator
    Inverts specified indices (or all if none specified)
    Used for targeted phase correction
    """
    result = register.copy()
    if indices is None:
        indices = range(len(register))
    
    for i in indices:
        result[i] = Trit(-int(result[i]))
    
    return result


def op_harmonic_merge(registers: List[TernaryRegister]) -> TernaryRegister:
    """
    H Harmonic Merge: Swarm Consensus Operator
    Combines multiple registers into unified field state
    Uses resonant averaging through zero
    """
    if not registers:
        raise ValueError("No registers to merge")
    
    size = registers[0].size
    result = TernaryRegister(size)
    
    for i in range(size):
        # Sum all trits at position i
        phase_sum = sum(int(reg[i]) for reg in registers)
        
        # Threshold to ternary with hysteresis
        if phase_sum > len(registers) // 2:
            result[i] = Trit.POS
        elif phase_sum < -len(registers) // 2:
            result[i] = Trit.NEG
        else:
            result[i] = Trit.ZERO  # Consensus through homeostasis
    
    return result


def op_resonate(register: TernaryRegister, frequency: int = 3) -> TernaryRegister:
    """
    Apply 3-6-9 harmonic resonance pattern
    Modulates trits based on position in harmonic cycle
    """
    result = register.copy()
    
    for i in range(len(register)):
        harmonic_position = (i % 9) + 1  # 1-9 cycle
        
        # 3-6-9 special positions amplify
        if harmonic_position in (3, 6, 9):
            if register[i] == Trit.ZERO:
                # Zero amplifies to phase based on neighbors
                left = register[i - 1] if i > 0 else Trit.ZERO
                right = register[i + 1] if i < len(register) - 1 else Trit.ZERO
                net_phase = int(left) + int(right)
                if net_phase != 0:
                    result[i] = Trit(1 if net_phase > 0 else -1)
    
    return result


# =============================================================================
# DEMONSTRATION
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("BALANCED TERNARY DIGIT ENGINE")
    print("Foundation: {-1, 0, +1} | Operators: ⊕⊗RCHI")
    print("=" * 60)
    
    # Create base register
    base = TernaryRegister(9, [1, 0, -1, 1, 0, 0, -1, 1, 0])
    print(f"\nBase Register:     {base}")
    print(f"Homeostatic Index: {base.homeostatic_index():.3f}")
    print(f"Phase Sum:         {base.phase_sum()}")
    print(f"Entropy:           {base.entropy_measure():.3f}")
    
    # Test XOR
    print("\n--- Operator ⊕ (XOR) ---")
    a, b = Trit.POS, Trit.NEG
    print(f"{a} ⊕ {b} = {op_xor(a, b)}")
    print(f"{Trit.POS} ⊕ {Trit.POS} = {op_xor(Trit.POS, Trit.POS)} (resonant cancellation)")
    
    # Test AND
    print("\n--- Operator ⊗ (AND) ---")
    print(f"{Trit.POS} ⊗ {Trit.NEG} = {op_and(Trit.POS, Trit.NEG)}")
    print(f"{Trit.POS} ⊗ {Trit.ZERO} = {op_and(Trit.POS, Trit.ZERO)} (zero absorption)")
    
    # Test Reversal
    print("\n--- Operator R (Reversal) ---")
    reversed_reg = op_reversal(base)
    print(f"Original:  {base}")
    print(f"Reversed:  {reversed_reg}")
    
    # Test Coherence
    print("\n--- Operator C (Coherence) ---")
    noisy = TernaryRegister(9, [1, -1, 1, 0, -1, 1, 0, -1, 1])
    coherent = op_coherence(noisy, window=3)
    print(f"Noisy:     {noisy}")
    print(f"Coherent:  {coherent}")
    print(f"Noisy entropy:     {noisy.entropy_measure():.3f}")
    print(f"Coherent entropy:  {coherent.entropy_measure():.3f}")
    
    # Test Harmonic Merge (Swarm)
    print("\n--- Operator H (Harmonic Merge) ---")
    swarm = [
        TernaryRegister(9, [1, 0, -1, 1, 0, 0, -1, 1, 0]),
        TernaryRegister(9, [1, 1, 0, 0, 0, 1, -1, 0, 1]),
        TernaryRegister(9, [-1, 0, 1, 1, 0, -1, 0, 1, 0]),
    ]
    merged = op_harmonic_merge(swarm)
    print(f"Node 1: {swarm[0]}")
    print(f"Node 2: {swarm[1]}")
    print(f"Node 3: {swarm[2]}")
    print(f"Merged: {merged}")
    
    # Test 3-6-9 Resonance
    print("\n--- 3-6-9 Harmonic Resonance ---")
    seed = TernaryRegister(9, [1, 0, 0, 0, 0, 0, 0, 0, 0])
    resonated = op_resonate(seed, frequency=3)
    print(f"Seed:       {seed}")
    print(f"Resonated:  {resonated}")
    
    # Demonstrate syntropic cycle
    print("\n" + "=" * 60)
    print("SYNTROPIC CYCLE DEMONSTRATION")
    print("=" * 60)
    
    chaotic = TernaryRegister(9, [1, -1, 1, -1, 1, -1, 1, -1, 1])
    print(f"\nChaotic state:   {chaotic}")
    print(f"Entropy:         {chaotic.entropy_measure():.3f}")
    print(f"Homeostasis:     {chaotic.homeostatic_index():.3f}")
    
    # Apply coherence
    step1 = op_coherence(chaotic, window=3)
    print(f"\nAfter Coherence: {step1}")
    print(f"Entropy:         {step1.entropy_measure():.3f}")
    print(f"Homeostasis:     {step1.homeostatic_index():.3f}")
    
    # Apply resonance
    step2 = op_resonate(step1)
    print(f"\nAfter Resonance: {step2}")
    print(f"Entropy:         {step2.entropy_measure():.3f}")
    print(f"Homeostasis:     {step2.homeostatic_index():.3f}")
    
    print("\n" + "=" * 60)
    print("DIGIT ENGINE READY FOR SWARM DEPLOYMENT")
    print("=" * 60)
