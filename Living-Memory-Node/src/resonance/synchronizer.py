"""
Resonance Synchronizer - 3-6-9 Harmonic Timing Loop

Locks swarm updates to Tesla's harmonic frequency framework.
Ensures transitions are rhythmic, not arbitrary.

Harmonic Cycles:
- 3-cycle: Basic ternary rhythm (NEG→ZERO→POS)
- 6-cycle: Dual-phase modulation (expansion/contraction pairs)
- 9-cycle: Complete fractal resonance (full harmonic spectrum)

The synchronizer gates all state transitions through these cycles,
creating coherent temporal structure across the swarm.
"""

import time
import math
from typing import Callable, List, Dict, Optional
from dataclasses import dataclass, field
from enum import Enum

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from core.digit_engine import Trit, TernaryRegister, op_resonate, op_coherence


class HarmonicPhase(Enum):
    """Positions within harmonic cycle"""
    PHASE_1 = 1   # Initiation
    PHASE_2 = 2   # Development
    PHASE_3 = 3   # First resonance point ★★★
    PHASE_4 = 4   # Transition
    PHASE_5 = 5   # Balance
    PHASE_6 = 6   # Second resonance point ★★★★★★
    PHASE_7 = 7   # Reflection
    PHASE_8 = 8   # Integration
    PHASE_9 = 9   # Complete resonance ★★★★★★★★★


@dataclass
class TimingState:
    """Current state of the harmonic timing loop"""
    cycle_type: int  # 3, 6, or 9
    current_phase: int  # 1-9
    cycle_count: int = 0
    last_tick_time: float = field(default_factory=time.time)
    accumulated_phase: float = 0.0
    
    def advance(self) -> 'TimingState':
        """Move to next phase in cycle"""
        self.current_phase += 1
        if self.current_phase > self.cycle_type:
            self.current_phase = 1
            self.cycle_count += 1
        return self
    
    def is_resonance_point(self) -> bool:
        """Check if current phase is a 3-6-9 resonance point"""
        return self.current_phase in (3, 6, 9)
    
    def get_harmonic_multiplier(self) -> float:
        """
        Return amplification factor based on phase position.
        Resonance points (3,6,9) have higher multiplier.
        """
        base = 1.0
        if self.current_phase == 3:
            return base * 1.5  # First resonance
        elif self.current_phase == 6:
            return base * 2.0  # Second resonance
        elif self.current_phase == 9:
            return base * 3.0  # Complete resonance
        return base
    
    def __str__(self) -> str:
        marker = "★" if self.is_resonance_point() else "·"
        return f"[{self.cycle_type}-cycle] Phase {self.current_phase}/9 {marker} (cycle #{self.cycle_count})"


class ResonanceSynchronizer:
    """
    Master timing controller for balanced ternary swarm.
    Gates all operations through harmonic 3-6-9 cycles.
    """
    
    def __init__(self, cycle_type: int = 9, base_interval: float = 0.1):
        """
        Args:
            cycle_type: Harmonic cycle length (3, 6, or 9)
            base_interval: Base time between ticks in seconds
        """
        self.timing = TimingState(cycle_type=cycle_type, current_phase=1)
        self.base_interval = base_interval
        self.tick_history: List[TimingState] = []
        self.resonance_events: List[Dict] = []
        self.coherence_tracking: List[float] = []
        
    def tick(self) -> TimingState:
        """
        Advance timing by one tick.
        Returns new timing state.
        """
        self.timing.advance()
        self.timing.last_tick_time = time.time()
        self.timing.accumulated_phase += 1
        
        # Record history
        self.tick_history.append(TimingState(
            cycle_type=self.timing.cycle_type,
            current_phase=self.timing.current_phase,
            cycle_count=self.timing.cycle_count
        ))
        
        # Track resonance events
        if self.timing.is_resonance_point():
            self.resonance_events.append({
                'phase': self.timing.current_phase,
                'cycle': self.timing.cycle_count,
                'multiplier': self.timing.get_harmonic_multiplier(),
                'timestamp': time.time()
            })
        
        return self.timing
    
    def should_update(self) -> bool:
        """
        Determine if swarm should update based on harmonic timing.
        Updates only allowed at specific phase transitions.
        """
        # Allow updates at phase boundaries and resonance points
        return self.timing.current_phase == 1 or self.timing.is_resonance_point()
    
    def get_modulation_factor(self) -> float:
        """
        Return current modulation factor for operations.
        Higher at resonance points, creating rhythmic intensity variation.
        """
        return self.timing.get_harmonic_multiplier()
    
    def run_cycle(self, operation: Callable, register: TernaryRegister) -> TernaryRegister:
        """
        Execute an operation with harmonic modulation.
        Operation intensity varies based on current phase.
        """
        self.tick()
        
        factor = self.get_modulation_factor()
        
        if self.timing.is_resonance_point():
            # At resonance: apply operation with amplification
            result = register.copy()
            # Apply operation multiple times based on multiplier
            iterations = int(factor)
            for _ in range(iterations):
                result = operation(result)
            return result
        else:
            # Between resonance: light coherence maintenance
            return op_coherence(register, window=3)
    
    def sync_to_external_clock(self, target_frequency: float):
        """
        Adjust base interval to match external frequency.
        Used for coupling with other resonant systems.
        """
        # Calculate appropriate interval for target frequency
        # Target: complete one 9-cycle in period of target frequency
        period = 1.0 / target_frequency
        self.base_interval = period / self.timing.cycle_type
    
    def measure_rhythm_coherence(self) -> float:
        """
        Analyze timing history for rhythmic consistency.
        Returns coherence score 0-1.
        """
        if len(self.tick_history) < 9:
            return 0.0
        
        # Check if resonance events are evenly spaced
        if len(self.resonance_events) < 2:
            return 0.5
        
        intervals = []
        for i in range(1, len(self.resonance_events)):
            dt = self.resonance_events[i]['timestamp'] - self.resonance_events[i-1]['timestamp']
            intervals.append(dt)
        
        if not intervals:
            return 0.0
        
        # Calculate variance (lower = more coherent)
        mean_interval = sum(intervals) / len(intervals)
        variance = sum((x - mean_interval) ** 2 for x in intervals) / len(intervals)
        
        # Convert to coherence score (inverse of variance)
        coherence = 1.0 / (1.0 + variance * 10)
        return min(coherence, 1.0)
    
    def get_status(self) -> Dict:
        """Return current synchronizer status"""
        return {
            'timing': str(self.timing),
            'phase': self.timing.current_phase,
            'cycle': self.timing.cycle_count,
            'is_resonance': self.timing.is_resonance_point(),
            'modulation': self.get_modulation_factor(),
            'rhythm_coherence': self.measure_rhythm_coherence(),
            'resonance_events_count': len(self.resonance_events),
            'total_ticks': len(self.tick_history)
        }
    
    def display_timing_lattice(self):
        """Visual representation of harmonic timing"""
        print(f"\n{'='*60}")
        print("HARMONIC TIMING LATTICE")
        print(f"{'='*60}")
        
        # Show recent history
        recent = self.tick_history[-18:] if len(self.tick_history) >= 18 else self.tick_history
        
        for i, state in enumerate(recent):
            marker = "★★★" if state.current_phase in (3, 6, 9) else "   "
            bar_len = state.current_phase * 2
            bar = "▓" * bar_len
            print(f"Tick {i:3d} | Phase {state.current_phase}/9 | {bar:<18} | {marker}")
        
        print(f"\nResonance Events: {len(self.resonance_events)}")
        print(f"Rhythm Coherence: {self.measure_rhythm_coherence():.3f}")
        print(f"{'='*60}\n")


class HarmonicSwarmController:
    """
    Combines swarm network with resonance synchronizer.
    All swarm operations gated by harmonic timing.
    """
    
    def __init__(self, swarm_network, synchronizer: ResonanceSynchronizer = None):
        self.swarm = swarm_network
        self.sync = synchronizer or ResonanceSynchronizer(cycle_type=9)
        self.evolution_log: List[Dict] = []
        
    def run_harmonic_cycle(self, verbose: bool = True) -> Dict:
        """
        Execute one swarm cycle synchronized to harmonic timing.
        """
        # Get modulation from synchronizer
        mod_factor = self.sync.get_modulation_factor()
        is_resonance = self.sync.timing.is_resonance_point()
        
        # Advance timing
        self.sync.tick()
        
        # Run swarm operations
        if is_resonance:
            # At resonance: full evolution with amplified operations
            metrics = self.swarm.run_cycle(local_cycles=int(mod_factor))
        else:
            # Between resonance: minimal update
            metrics = self.swarm.run_cycle(local_cycles=1)
        
        # Add timing info to metrics
        metrics['harmonic_phase'] = self.sync.timing.current_phase
        metrics['is_resonance'] = is_resonance
        metrics['modulation'] = mod_factor
        
        self.evolution_log.append(metrics)
        
        if verbose and is_resonance:
            print(f"RESONANCE @ Phase {self.sync.timing.current_phase}: "
                  f"η̄={metrics['avg_coherence']:.3f} | multiplier={mod_factor}x")
        
        return metrics
    
    def run_full_evolution(self, cycles: int = 27, verbose: bool = True) -> List[Dict]:
        """
        Run complete harmonic evolution (default 27 = 3³ cycles).
        """
        history = []
        
        if verbose:
            print(f"\n{'='*60}")
            print(f"HARMONIC SWARM EVOLUTION")
            print(f"Cycles: {cycles} | Nodes: {len(self.swarm.nodes)} | Base: 3-6-9")
            print(f"{'='*60}\n")
        
        for i in range(cycles):
            metrics = self.run_harmonic_cycle(verbose=False)
            history.append(metrics)
            
            if verbose:
                resonance_marker = "★★★" if metrics['is_resonance'] else "   "
                print(f"Step {i:3d} {resonance_marker} | "
                      f"Phase {metrics['harmonic_phase']}/9 | "
                      f"η̄={metrics['avg_coherence']:.3f} | "
                      f"mod={metrics['modulation']:.1f}x")
        
        if verbose:
            print(f"\n{'='*60}")
            print("HARMONIC EVOLUTION COMPLETE")
            print(f"{'='*60}\n")
        
        return history
    
    def analyze_harmonic_correlation(self) -> Dict:
        """
        Analyze correlation between harmonic phases and swarm coherence.
        """
        if not self.evolution_log:
            return {}
        
        # Group coherence by phase
        phase_coherence = {i: [] for i in range(1, 10)}
        
        for entry in self.evolution_log:
            phase = entry['harmonic_phase']
            phase_coherence[phase].append(entry['avg_coherence'])
        
        # Calculate averages per phase
        phase_averages = {}
        for phase, values in phase_coherence.items():
            if values:
                phase_averages[phase] = sum(values) / len(values)
        
        # Find best/worst phases
        best_phase = max(phase_averages, key=phase_averages.get) if phase_averages else None
        worst_phase = min(phase_averages, key=phase_averages.get) if phase_averages else None
        
        return {
            'phase_averages': phase_averages,
            'best_phase': best_phase,
            'worst_phase': worst_phase,
            'resonance_advantage': (
                phase_averages.get(9, 0) - phase_averages.get(1, 0)
                if best_phase and worst_phase else 0
            )
        }


# =============================================================================
# DEMONSTRATION
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("RESONANCE SYNCHRONIZER - 3-6-9 HARMONIC TIMING")
    print("=" * 60)
    
    # Test basic synchronizer
    sync = ResonanceSynchronizer(cycle_type=9, base_interval=0.05)
    
    print("\nRunning 27 ticks (3 complete 9-cycles)...")
    for _ in range(27):
        sync.tick()
    
    sync.display_timing_lattice()
    
    # Test with swarm
    print("\n" + "=" * 60)
    print("INTEGRATED HARMONIC SWARM CONTROLLER")
    print("=" * 60)
    
    # Import swarm here to avoid circular dependency
    from swarm.nodes import SwarmNetwork
    
    swarm = SwarmNetwork(num_nodes=9, register_size=9)
    swarm.initialize_swarm(density=0.5)
    
    controller = HarmonicSwarmController(swarm)
    
    # Run harmonic evolution
    history = controller.run_full_evolution(cycles=27, verbose=True)
    
    # Analyze results
    analysis = controller.analyze_harmonic_correlation()
    
    print("\nHARMONIC ANALYSIS")
    print("-" * 40)
    print(f"Best Phase: {analysis.get('best_phase')}")
    print(f"Worst Phase: {analysis.get('worst_phase')}")
    print(f"Phase Averages:")
    for phase in range(1, 10):
        avg = analysis['phase_averages'].get(phase, 0)
        marker = "← RESONANCE" if phase in (3, 6, 9) else ""
        print(f"  Phase {phase}: η̄={avg:.3f} {marker}")
    
    # Final swarm state
    print("\nFinal Swarm State:")
    swarm.display_lattice()
    
    print("\n" + "=" * 60)
    print("SYNCHRONIZER READY FOR VISUALIZATION OVERLAY")
    print("=" * 60)
