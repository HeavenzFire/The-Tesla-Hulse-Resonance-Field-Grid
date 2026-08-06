"""
Lattice Visualizer - Balanced Ternary State Overlay

Maps ternary states to geometry and color, showing coherence dynamically.
Creates ASCII-based visualization of swarm lattice structure.

Visualization Modes:
- LATTICE: Grid view of all nodes
- WAVEFORM: Phase progression over time  
- COHERENCE_MAP: Heat map of homeostatic index
- PHASE_SPHERE: 3D-like projection of phase distribution
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from core.digit_engine import Trit, TernaryRegister
from typing import List, Dict, Optional


# =============================================================================
# COLOR/CHARACTER MAPS
# =============================================================================

class VisualTheme:
    """Visual themes for lattice rendering"""
    
    # Classic terminal theme
    CLASSIC = {
        Trit.NEG: '━',  # Negative: horizontal line (contraction)
        Trit.ZERO: '○',  # Zero: circle (homeostasis/balance)
        Trit.POS: '┃',  # Positive: vertical line (expansion/growth)
    }
    
    # Box theme with fills
    BOXED = {
        Trit.NEG: '░',
        Trit.ZERO: '▒',
        Trit.POS: '▓',
    }
    
    # Geometric theme
    GEOMETRIC = {
        Trit.NEG: '◂',  # Left triangle
        Trit.ZERO: '●',  # Filled circle
        Trit.POS: '▸',  # Right triangle
    }
    
    # Color codes (ANSI)
    COLORS = {
        Trit.NEG: '\033[91m',  # Red (contraction/warning)
        Trit.ZERO: '\033[92m',  # Green (balance/homeostasis)
        Trit.POS: '\033[94m',  # Blue (expansion/growth)
        'RESET': '\033[0m',
        'DIM': '\033[2m',
        'BRIGHT': '\033[1m',
    }
    
    # Coherence heat map colors
    HEAT_LOW = '\033[91m'    # Red for low coherence
    HEAT_MID = '\033[93m'    # Yellow for medium
    HEAT_HIGH = '\033[92m'   # Green for high
    HEAT_MAX = '\033[95m'    # Magenta for perfect


def get_coherence_color(coherence: float) -> str:
    """Return ANSI color code based on coherence level"""
    if coherence >= 0.9:
        return VisualTheme.HEAT_MAX
    elif coherence >= 0.7:
        return VisualTheme.HEAT_HIGH
    elif coherence >= 0.4:
        return VisualTheme.HEAT_MID
    else:
        return VisualTheme.HEAT_LOW


def render_trit(trit: Trit, use_color: bool = True) -> str:
    """Render a single trit with optional color"""
    char = VisualTheme.CLASSIC[trit]
    if use_color:
        color = VisualTheme.COLORS[trit]
        reset = VisualTheme.COLORS['RESET']
        return f"{color}{char}{reset}"
    return char


def render_register(register: TernaryRegister, use_color: bool = True) -> str:
    """Render entire register as string"""
    chars = [render_trit(t, use_color) for t in register.trits]
    return ''.join(chars)


# =============================================================================
# VISUALIZATION MODES
# =============================================================================

class LatticeVisualizer:
    """Main visualizer for balanced ternary systems"""
    
    def __init__(self, width: int = 80, height: int = 24):
        self.width = width
        self.height = height
        self.use_color = sys.stdout.isatty()  # Auto-detect terminal color support
    
    def render_lattice(self, registers: List[TernaryRegister], 
                       labels: List[str] = None,
                       title: str = "TERNARY LATTICE") -> str:
        """
        Render grid view of multiple registers.
        Each row shows one register state.
        """
        lines = []
        
        # Header
        lines.append("╔" + "═" * (self.width - 2) + "╗")
        title_padded = f" {title} ".center(self.width - 2)
        lines.append("║" + title_padded[:self.width - 2] + "║")
        lines.append("╠" + "═" * (self.width - 2) + "╣")
        
        # Register rows
        for i, reg in enumerate(registers):
            label = labels[i] if labels and i < len(labels) else f"Node {i:2d}"
            
            # Build row
            row_chars = []
            for t in reg.trits:
                row_chars.append(render_trit(t, self.use_color))
            
            register_str = ''.join(row_chars)
            
            # Coherence indicator
            coherence = reg.homeostatic_index()
            coh_bar = '█' * int(coherence * 10)
            
            row = f"{label} │ {register_str} │ [{coh_bar:<10}] {coherence:.2f}"
            lines.append(f"║ {row:<{self.width - 4}} ║")
        
        # Footer
        lines.append("╚" + "═" * (self.width - 2) + "╝")
        
        return '\n'.join(lines)
    
    def render_waveform(self, history: List[TernaryRegister],
                        position: int = 0,
                        title: str = "PHASE WAVEFORM") -> str:
        """
        Render phase evolution over time as waveform.
        Shows how a specific position changes through generations.
        """
        lines = []
        
        # Header
        lines.append(f"\n{'─' * self.width}")
        lines.append(f" {title} - Position {position}")
        lines.append(f"{'─' * self.width}\n")
        
        # Waveform area (phases -1, 0, +1)
        wave_height = 7
        
        for row in range(wave_height - 1, -1, -1):
            line = ""
            for gen, reg in enumerate(history):
                if gen >= self.width - 10:
                    break
                
                trit = reg[position] if position < len(reg) else Trit.ZERO
                trit_val = int(trit)
                
                # Map trit to wave position (-1→bottom, 0→middle, +1→top)
                wave_pos = (trit_val + 1) * (wave_height // 2)
                
                if row == wave_pos:
                    if trit_val == 1:
                        line += '▲'
                    elif trit_val == 0:
                        line += '●'
                    else:
                        line += '▼'
                elif row == wave_height // 2:
                    line += '─'
                else:
                    line += ' '
            
            # Y-axis labels
            y_label = "+1" if row == wave_height - 1 else \
                      " 0" if row == wave_height // 2 else \
                      "-1" if row == 0 else "  "
            
            lines.append(f"{y_label} │{line}")
        
        # X-axis
        lines.append("   └" + "─" * min(len(history), self.width - 10) + "> time")
        lines.append(f"     Generations: 0 to {len(history) - 1}")
        
        return '\n'.join(lines)
    
    def render_coherence_map(self, swarm_metrics_history: List[Dict],
                             title: str = "COHERENCE EVOLUTION") -> str:
        """
        Render heat map of coherence over time.
        Shows swarm-wide coherence evolution.
        """
        lines = []
        
        lines.append(f"\n{'═' * self.width}")
        lines.append(f" {title}")
        lines.append(f"{'═' * self.width}\n")
        
        # Extract coherence values
        if not swarm_metrics_history:
            return "No data available"
        
        max_width = self.width - 15
        
        for entry in swarm_metrics_history[-max_width:]:
            coherence = entry.get('avg_coherence', 0)
            gen = entry.get('generation', 0)
            
            # Bar representation
            bar_len = int(coherence * 40)
            bar = '█' * bar_len
            
            # Color based on coherence
            if self.use_color:
                color = get_coherence_color(coherence)
                reset = VisualTheme.COLORS['RESET']
                bar = f"{color}{bar}{reset}"
            
            # Resonance marker
            resonance = " ★★★" if entry.get('is_resonance', False) else ""
            
            lines.append(f"Gen {gen:3d} │{bar:<40}│ {coherence:.3f}{resonance}")
        
        # Statistics
        if len(swarm_metrics_history) > 0:
            coherences = [e.get('avg_coherence', 0) for e in swarm_metrics_history]
            avg_coh = sum(coherences) / len(coherences)
            min_coh = min(coherences)
            max_coh = max(coherences)
            
            lines.append(f"\nStatistics:")
            lines.append(f"  Average: {avg_coh:.3f}")
            lines.append(f"  Min:     {min_coh:.3f}")
            lines.append(f"  Max:     {max_coh:.3f}")
        
        return '\n'.join(lines)
    
    def render_phase_sphere(self, register: TernaryRegister,
                           title: str = "PHASE DISTRIBUTION") -> str:
        """
        Render phase distribution as pseudo-3D sphere projection.
        Shows balance between NEG/ZERO/POS states.
        """
        lines = []
        
        # Count phases
        counts = {-1: 0, 0: 0, 1: 0}
        for t in register.trits:
            counts[int(t)] += 1
        
        total = len(register)
        
        lines.append(f"\n┌{'─' * (self.width - 2)}┐")
        lines.append(f"│ {title.center(self.width - 4)} │")
        lines.append(f"├{'─' * (self.width - 2)}┤")
        
        # Phase distribution bars
        for phase, label in [(-1, "NEG"), (0, "ZERO"), (1, "POS")]:
            count = counts[phase]
            pct = count / total * 100
            bar_len = int(pct / 2.5)  # Scale to ~40 chars max
            
            bar_char = VisualTheme.CLASSIC[Trit(phase)]
            bar = bar_char * bar_len
            
            if self.use_color:
                color = VisualTheme.COLORS[Trit(phase)]
                reset = VisualTheme.COLORS['RESET']
                bar = f"{color}{bar}{reset}"
            
            line = f"│ {label:4s} ({count:2d}/{total}) │{bar:<40}│ {pct:5.1f}% │"
            lines.append(line)
        
        # Summary metrics
        coherence = register.homeostatic_index()
        phase_sum = register.phase_sum()
        entropy = register.entropy_measure()
        
        lines.append(f"├{'─' * (self.width - 2)}┤")
        lines.append(f"│ Homeostasis: {coherence:.3f}  |  Phase Sum: {phase_sum:+3d}  |  Entropy: {entropy:.3f}  {' ' * 15}│")
        lines.append(f"└{'─' * (self.width - 2)}┘")
        
        return '\n'.join(lines)
    
    def render_full_dashboard(self, swarm, synchronizer=None) -> str:
        """
        Complete dashboard showing all visualization modes.
        """
        output = []
        
        # Section 1: Lattice view
        registers = [node.register for node in swarm.nodes]
        labels = [f"Node {n.node_id}" for n in swarm.nodes]
        output.append(self.render_lattice(registers, labels, "SWARM LATTICE"))
        
        # Section 2: Phase spheres for key nodes
        output.append("\n" + "=" * self.width)
        output.append("INDIVIDUAL NODE ANALYSIS")
        output.append("=" * self.width)
        
        for node in swarm.nodes[:3]:  # Show first 3 nodes
            output.append(self.render_phase_sphere(node.register, f"NODE {node.node_id}"))
        
        # Section 3: Synchronizer status if available
        if synchronizer:
            output.append("\n" + "=" * self.width)
            output.append("RESONANCE SYNCHRONIZER STATUS")
            output.append("=" * self.width)
            
            status = synchronizer.get_status()
            output.append(f"Current Phase: {status['phase']}/9")
            output.append(f"Cycle Count:   {status['cycle']}")
            output.append(f"Is Resonance:  {status['is_resonance']}")
            output.append(f"Modulation:    {status['modulation']}x")
            output.append(f"Rhythm Coh:    {status['rhythm_coherence']:.3f}")
        
        return '\n'.join(output)


# =============================================================================
# DEMONSTRATION
# =============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("LATTICE VISUALIZER - BALANCED TERNARY STATE OVERLAY")
    print("=" * 80)
    
    # Import required modules
    from swarm.nodes import SwarmNetwork
    from resonance.synchronizer import HarmonicSwarmController, ResonanceSynchronizer
    
    # Create test data
    swarm = SwarmNetwork(num_nodes=9, register_size=9)
    swarm.initialize_swarm(density=0.4)
    
    # Run a few cycles to generate history
    sync = ResonanceSynchronizer(cycle_type=9)
    controller = HarmonicSwarmController(swarm, sync)
    
    print("\nRunning 15 harmonic cycles to generate visualization data...")
    history = controller.run_full_evolution(cycles=15, verbose=False)
    
    # Create visualizer
    viz = LatticeVisualizer(width=80, height=24)
    
    # Display full dashboard
    print("\n")
    print(viz.render_full_dashboard(swarm, sync))
    
    # Show waveform for node 0, position 0
    register_history = [swarm.nodes[0].register.copy() for _ in range(1)]
    # Generate some history by running more cycles
    temp_swarm = SwarmNetwork(num_nodes=1, register_size=9)
    temp_swarm.nodes[0].initialize_random(0.5)
    wave_history = []
    for _ in range(30):
        wave_history.append(temp_swarm.nodes[0].register.copy())
        temp_swarm.run_cycle()
    
    print(viz.render_waveform(wave_history, 0, "NODE 0 POSITION 0 WAVEFORM"))
    
    # Show coherence map
    print(viz.render_coherence_map(history, "SWARM COHERENCE EVOLUTION"))
    
    print("\n" + "=" * 80)
    print("VISUALIZER READY FOR REAL-TIME OVERLAY DEPLOYMENT")
    print("=" * 80)
