"""
Swarm Node Layer - Balanced Ternary Distributed Agents

Each node runs the digit engine independently and communicates
via resonance signals. Nodes achieve consensus through Harmonic Merge.

Architecture:
- SwarmNode: Individual agent with local register state
- ResonanceSignal: Inter-node communication packet
- SwarmNetwork: Collection of nodes with broadcast/merge capabilities
"""

import random
import time
from typing import List, Dict, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from core.digit_engine import Trit, TernaryRegister, op_harmonic_merge, op_coherence, op_resonate


class NodeState(Enum):
    """Node operational states"""
    IDLE = "idle"
    COMPUTING = "computing"
    BROADCASTING = "broadcasting"
    SYNCING = "syncing"
    COHERENT = "coherent"


@dataclass
class ResonanceSignal:
    """
    Inter-node communication packet
    Carries ternary state + phase information
    """
    sender_id: int
    payload: TernaryRegister
    phase_signature: int = 0  # Net phase sum for quick filtering
    timestamp: float = field(default_factory=time.time)
    coherence_level: float = 0.0
    
    def __post_init__(self):
        if self.phase_signature == 0 and len(self.payload) > 0:
            self.phase_signature = self.payload.phase_sum()
        if self.coherence_level == 0.0:
            self.coherence_level = self.payload.homeostatic_index()
    
    def __str__(self) -> str:
        return f"Signal[{self.sender_id}] φ={self.phase_signature} η={self.coherence_level:.2f}"


class SwarmNode:
    """
    Individual swarm agent running the balanced ternary digit engine.
    Each node maintains local state and participates in collective resonance.
    """
    
    def __init__(self, node_id: int, register_size: int = 9):
        self.node_id = node_id
        self.register = TernaryRegister(register_size)
        self.state = NodeState.IDLE
        self.inbox: List[ResonanceSignal] = []
        self.outbox: List[ResonanceSignal] = []
        self.generation = 0
        self.resonance_history: List[float] = []
        
        # Node-specific phase offset (creates diversity in swarm)
        self.phase_offset = node_id % 3
        
    def initialize_random(self, density: float = 0.3):
        """Initialize register with random ternary state"""
        state = []
        for _ in range(len(self.register)):
            r = random.random()
            if r < density / 2:
                state.append(-1)
            elif r > 1 - density / 2:
                state.append(1)
            else:
                state.append(0)
        self.register = TernaryRegister(len(self.register), state)
        self.generation = 0
        
    def compute_local(self, cycles: int = 1) -> 'SwarmNode':
        """
        Apply local computation cycles using nonlinear operators
        Evolves state toward coherence through internal dynamics
        """
        self.state = NodeState.COMPUTING
        
        for _ in range(cycles):
            # Alternate between coherence and resonance
            if self.generation % 2 == 0:
                self.register = op_coherence(self.register, window=3)
            else:
                self.register = op_resonate(self.register)
            
            self.generation += 1
        
        self.state = NodeState.IDLE
        return self
    
    def receive_signal(self, signal: ResonanceSignal):
        """Accept incoming resonance signal from another node"""
        if signal.sender_id != self.node_id:
            self.inbox.append(signal)
    
    def broadcast_state(self) -> Optional[ResonanceSignal]:
        """Create outgoing signal with current state"""
        self.state = NodeState.BROADCASTING
        signal = ResonanceSignal(
            sender_id=self.node_id,
            payload=self.register.copy()
        )
        self.outbox.append(signal)
        self.state = NodeState.IDLE
        return signal
    
    def sync_with_signals(self, merge_threshold: float = 0.5) -> 'SwarmNode':
        """
        Integrate received signals through harmonic merge
        Achieves consensus with neighboring nodes
        """
        if not self.inbox:
            return self
        
        self.state = NodeState.SYNCING
        
        # Collect all registers (self + received)
        registers = [self.register.copy()]
        for signal in self.inbox:
            if signal.coherence_level >= merge_threshold:
                registers.append(signal.payload)
        
        if len(registers) > 1:
            # Harmonic merge for consensus
            merged = op_harmonic_merge(registers)
            self.register = merged
            self.resonance_history.append(merged.homeostatic_index())
        
        # Clear inbox after processing
        self.inbox.clear()
        self.state = NodeState.IDLE
        return self
    
    def measure_coherence(self) -> float:
        """Return current homeostatic index"""
        return self.register.homeostatic_index()
    
    def get_phase_balance(self) -> Dict[str, int]:
        """Count distribution of trit states"""
        counts = {Trit.NEG: 0, Trit.ZERO: 0, Trit.POS: 0}
        for t in self.register.trits:
            counts[t] += 1
        return {-1: counts[Trit.NEG], 0: counts[Trit.ZERO], 1: counts[Trit.POS]}
    
    def __str__(self) -> str:
        return f"Node[{self.node_id}] gen={self.generation} η={self.measure_coherence():.2f} {self.register}"


class SwarmNetwork:
    """
    Network of swarm nodes with communication infrastructure.
    Manages broadcast, synchronization, and global coherence measurement.
    """
    
    def __init__(self, num_nodes: int = 9, register_size: int = 9):
        self.nodes = [SwarmNode(i, register_size) for i in range(num_nodes)]
        self.generation = 0
        self.topology = "fully_connected"  # Can evolve to: ring, mesh, hierarchical
        
    def initialize_swarm(self, density: float = 0.4):
        """Initialize all nodes with random states"""
        for node in self.nodes:
            node.initialize_random(density)
        self.generation = 0
        
    def broadcast_all(self):
        """All nodes broadcast their state"""
        signals = []
        for node in self.nodes:
            signal = node.broadcast_state()
            if signal:
                signals.append(signal)
        return signals
    
    def distribute_signals(self, signals: List[ResonanceSignal]):
        """Distribute broadcast signals to all nodes (fully connected)"""
        for node in self.nodes:
            for signal in signals:
                node.receive_signal(signal)
    
    def sync_all(self):
        """All nodes sync with received signals"""
        for node in self.nodes:
            node.sync_with_signals()
    
    def run_cycle(self, local_cycles: int = 1) -> Dict:
        """
        Execute one complete swarm cycle:
        1. Local computation
        2. Broadcast
        3. Distribution
        4. Synchronization
        """
        # Phase 1: Local computation
        for node in self.nodes:
            node.compute_local(local_cycles)
        
        # Phase 2: Broadcast
        signals = self.broadcast_all()
        
        # Phase 3: Distribute
        self.distribute_signals(signals)
        
        # Phase 4: Sync
        self.sync_all()
        
        self.generation += 1
        
        # Return metrics
        return self.get_metrics()
    
    def get_metrics(self) -> Dict:
        """Calculate swarm-wide coherence metrics"""
        coherence_values = [node.measure_coherence() for node in self.nodes]
        phase_sums = [node.register.phase_sum() for node in self.nodes]
        
        return {
            'generation': self.generation,
            'avg_coherence': sum(coherence_values) / len(coherence_values),
            'min_coherence': min(coherence_values),
            'max_coherence': max(coherence_values),
            'phase_variance': sum(abs(p) for p in phase_sums) / len(phase_sums),
            'nodes_coherent': sum(1 for c in coherence_values if c > 0.6),
        }
    
    def run_evolution(self, cycles: int = 10, verbose: bool = True) -> List[Dict]:
        """Run multiple evolution cycles and track metrics"""
        history = []
        
        if verbose:
            print(f"\n{'='*60}")
            print(f"SWARM EVOLUTION: {len(self.nodes)} nodes, {cycles} cycles")
            print(f"{'='*60}")
        
        for i in range(cycles):
            metrics = self.run_cycle(local_cycles=1)
            history.append(metrics)
            
            if verbose:
                print(f"Gen {metrics['generation']:3d} | "
                      f"η̄={metrics['avg_coherence']:.3f} | "
                      f"coherent={metrics['nodes_coherent']}/{len(self.nodes)} | "
                      f"φ_var={metrics['phase_variance']:.2f}")
        
        if verbose:
            print(f"{'='*60}")
            print("EVOLUTION COMPLETE")
            print(f"{'='*60}\n")
        
        return history
    
    def display_lattice(self):
        """Visual representation of swarm state"""
        print(f"\n--- Swarm Lattice (Generation {self.generation}) ---")
        for node in self.nodes:
            coherence_bar = '█' * int(node.measure_coherence() * 10)
            print(f"Node {node.node_id:2d} [{coherence_bar:<10}] {node.register}")
        print()
    
    def find_most_coherent(self) -> SwarmNode:
        """Return the node with highest coherence"""
        return max(self.nodes, key=lambda n: n.measure_coherence())
    
    def find_least_coherent(self) -> SwarmNode:
        """Return the node with lowest coherence"""
        return min(self.nodes, key=lambda n: n.measure_coherence())


# =============================================================================
# DEMONSTRATION
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("BALANCED TERNARY SWARM NETWORK")
    print("Nodes: 9 | Register Size: 9 | Topology: Fully Connected")
    print("=" * 60)
    
    # Create swarm
    swarm = SwarmNetwork(num_nodes=9, register_size=9)
    
    # Initialize with moderate chaos
    swarm.initialize_swarm(density=0.5)
    
    print("\nInitial State:")
    swarm.display_lattice()
    
    initial_metrics = swarm.get_metrics()
    print(f"Average Coherence: {initial_metrics['avg_coherence']:.3f}")
    print(f"Coherent Nodes: {initial_metrics['nodes_coherent']}/9")
    
    # Run evolution
    history = swarm.run_evolution(cycles=8, verbose=True)
    
    # Final state
    print("Final State:")
    swarm.display_lattice()
    
    final_metrics = swarm.get_metrics()
    print(f"Average Coherence: {final_metrics['avg_coherence']:.3f}")
    print(f"Coherent Nodes: {final_metrics['nodes_coherent']}/9")
    
    # Show improvement
    improvement = final_metrics['avg_coherence'] - initial_metrics['avg_coherence']
    print(f"\nCoherence Improvement: {improvement:+.3f} ({improvement/initial_metrics['avg_coherence']*100:+.1f}%)")
    
    # Identify key nodes
    most_coherent = swarm.find_most_coherent()
    least_coherent = swarm.find_least_coherent()
    
    print(f"\nMost Coherent Node:  {most_coherent}")
    print(f"Least Coherent Node: {least_coherent}")
    
    # Demonstrate single node operations
    print("\n" + "=" * 60)
    print("SINGLE NODE DEEP DIVE")
    print("=" * 60)
    
    node = swarm.nodes[0]
    print(f"\nNode 0 State: {node.register}")
    print(f"Phase Balance: {node.get_phase_balance()}")
    print(f"Coherence: {node.measure_coherence():.3f}")
    print(f"Generation: {node.generation}")
    print(f"Resonance History: {node.resonance_history[-3:] if node.resonance_history else '[]'}")
    
    print("\n" + "=" * 60)
    print("SWARM LAYER READY FOR RESONANCE SYNCHRONIZER")
    print("=" * 60)
