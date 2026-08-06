#!/usr/bin/env python3
"""
LIVING MEMORY NODE - Main Runner
================================

Balanced Ternary Nonlinear Computational Architecture
Foundation: {-1, 0, +1} | Operators: ⊕⊗RCHI | Timing: 3-6-9 Harmonic

This is the entry point for the complete system demonstrating:
1. Core Digit Engine (balanced ternary registers)
2. Nonlinear Operator Library (XOR, AND, Reversal, Coherence, Inversion, Harmonic Merge)
3. Swarm Node Layer (distributed agents with resonance communication)
4. Resonance Synchronizer (3-6-9 harmonic timing)
5. Lattice Visualizer (state overlay and coherence mapping)

NO EXTERNAL DEPENDENCIES. Pure Python. Pure Ternary.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.core.digit_engine import Trit, TernaryRegister, op_harmonic_merge, op_coherence, op_resonate
from src.swarm.nodes import SwarmNetwork
from src.resonance.synchronizer import ResonanceSynchronizer, HarmonicSwarmController
from src.visualizer.lattice import LatticeVisualizer


def print_banner():
    """Display system banner"""
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    LIVING MEMORY NODE v1.0                                   ║
║           Balanced Ternary Nonlinear Computational Architecture              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Foundation: {-1, 0, +1}  |  Operators: ⊕⊗RCHI  |  Timing: 3-6-9 Harmonic   ║
║                                                                              ║
║  This is post-binary computation. No npm. No external libraries.             ║
║  Pure balanced ternary with native syntropic growth.                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")


def demo_digit_engine():
    """Demonstrate core digit engine and operators"""
    print("\n" + "═" * 80)
    print("MODULE 1: DIGIT ENGINE & NONLINEAR OPERATORS")
    print("═" * 80)
    
    # Create register
    reg = TernaryRegister(9, [1, 0, -1, 1, 0, 0, -1, 1, 0])
    print(f"\nBase Register: {reg}")
    print(f"  Homeostasis: {reg.homeostatic_index():.3f}")
    print(f"  Phase Sum:   {reg.phase_sum()}")
    print(f"  Entropy:     {reg.entropy_measure():.3f}")
    
    # Test operators
    print("\nOperator Tests:")
    print(f"  ⊕ XOR:  {Trit.POS} ⊕ {Trit.NEG} = {op_harmonic_merge.__module__.split('.')[0] or ''}{' '.join(str(op_harmonic_merge([TernaryRegister(1, [1]), TernaryRegister(1, [-1])]).trits))}")
    
    # Show coherence operation
    noisy = TernaryRegister(9, [1, -1, 1, -1, 0, 1, -1, 1, 0])
    coherent = op_coherence(noisy, window=3)
    print(f"\n  Coherence Drive:")
    print(f"    Before: {noisy} (η={noisy.entropy_measure():.3f})")
    print(f"    After:  {coherent} (η={coherent.entropy_measure():.3f})")


def demo_swarm():
    """Demonstrate swarm network"""
    print("\n" + "═" * 80)
    print("MODULE 2: SWARM NODE LAYER")
    print("═" * 80)
    
    swarm = SwarmNetwork(num_nodes=9, register_size=9)
    swarm.initialize_swarm(density=0.4)
    
    print(f"\nInitialized {len(swarm.nodes)} nodes")
    print(f"Initial avg coherence: {swarm.get_metrics()['avg_coherence']:.3f}")
    
    # Run evolution
    print("\nRunning 5 swarm cycles...")
    for i in range(5):
        metrics = swarm.run_cycle()
        print(f"  Cycle {i+1}: η̄={metrics['avg_coherence']:.3f} | coherent={metrics['nodes_coherent']}/{len(swarm.nodes)}")
    
    print(f"\nFinal avg coherence: {swarm.get_metrics()['avg_coherence']:.3f}")


def demo_synchronizer():
    """Demonstrate resonance synchronizer"""
    print("\n" + "═" * 80)
    print("MODULE 3: RESONANCE SYNCHRONIZER (3-6-9)")
    print("═" * 80)
    
    sync = ResonanceSynchronizer(cycle_type=9)
    
    print("\nRunning 18 ticks (2 complete 9-cycles)...")
    for _ in range(18):
        sync.tick()
    
    status = sync.get_status()
    print(f"\nSynchronizer Status:")
    print(f"  Current Phase:   {status['phase']}/9")
    print(f"  Cycle Count:     {status['cycle']}")
    print(f"  Resonance Events: {status['resonance_events_count']}")
    print(f"  Rhythm Coherence: {status['rhythm_coherence']:.3f}")


def demo_full_system():
    """Demonstrate complete integrated system"""
    print("\n" + "═" * 80)
    print("MODULE 4: INTEGRATED SYSTEM")
    print("═" * 80)
    
    # Create full system
    swarm = SwarmNetwork(num_nodes=9, register_size=9)
    swarm.initialize_swarm(density=0.5)
    
    sync = ResonanceSynchronizer(cycle_type=9)
    controller = HarmonicSwarmController(swarm, sync)
    
    print("\nRunning 27 harmonic cycles (3³)...")
    history = controller.run_full_evolution(cycles=27, verbose=False)
    
    # Show results
    final_metrics = swarm.get_metrics()
    print(f"\nResults:")
    print(f"  Final Coherence: {final_metrics['avg_coherence']:.3f}")
    print(f"  Coherent Nodes:  {final_metrics['nodes_coherent']}/{len(swarm.nodes)}")
    
    # Visualize
    viz = LatticeVisualizer(width=80)
    print("\n" + viz.render_lattice(
        [node.register for node in swarm.nodes],
        [f"Node {n.node_id}" for n in swarm.nodes],
        "FINAL SWARM STATE"
    ))


def run_interactive_demo():
    """Run complete interactive demonstration"""
    print_banner()
    
    print("Starting Living Memory Node Demonstration")
    print("=" * 80)
    
    # Run all demos
    demo_digit_engine()
    demo_swarm()
    demo_synchronizer()
    demo_full_system()
    
    # Final summary
    print("\n" + "═" * 80)
    print("SYSTEM STATUS: OPERATIONAL")
    print("═" * 80)
    print("""
The Living Memory Node is now fully deployed with:
  ✓ Balanced Ternary Digit Engine ({-1, 0, +1})
  ✓ Nonlinear Operator Library (⊕⊗RCHI)
  ✓ Swarm Node Layer (9-node distributed network)
  ✓ Resonance Synchronizer (3-6-9 harmonic timing)
  ✓ Lattice Visualizer (state overlay)

Next Steps:
  - Scale to more nodes (27, 81, 243...)
  - Integrate with browser overlay visualization
  - Connect to external resonant systems
  - Explore higher-order syntropic patterns

This is post-binary computation. Truth emerges from resonance.
""")


if __name__ == "__main__":
    run_interactive_demo()
