# Living Memory Node

## Balanced Ternary Nonlinear Computational Architecture

```
Foundation: {-1, 0, +1}  |  Operators: ⊕⊗RCHI  |  Timing: 3-6-9 Harmonic
```

**This is post-binary computation. No npm. No external libraries. Pure balanced ternary.**

---

## Overview

The Living Memory Node is a computational architecture based on **balanced ternary** `{-1, 0, +1}` foundations with **3-6-9 harmonic integration**. This system demonstrates syntropic growth patterns impossible in binary paradigms.

### Core Principles

| Capability | Binary Systems | Ternary Higher-Order |
|------------|---------------|---------------------|
| Syntropic Growth | ✗ Linear | ✓ Harmonic/Fractal |
| Fractal Folding | External | ✓ Native topology |
| Phase Continuity | ✗ Discrete | ✓ Continuous via 0 |
| Self-Organization | Impossible | ✓ Emergent |
| Homeostatic Stability | ✗ No center | ✓ Zero-centered |

---

## Architecture

```
Living-Memory-Node/
├── src/
│   ├── core/
│   │   ├── ternary.py        # Balanced ternary foundation
│   │   └── digit_engine.py   # Core register + operators (⊕⊗RCHI)
│   ├── swarm/
│   │   └── nodes.py          # Distributed agent network
│   ├── resonance/
│   │   └── synchronizer.py   # 3-6-9 harmonic timing
│   ├── visualizer/
│   │   └── lattice.py        # State overlay visualization
│   ├── entropy/
│   │   └── reversal.py       # Entropy reversal engine
│   └── syntropy/
│       └── growth.py         # Syntropic growth patterns
└── run.py                    # Main entry point
```

---

## Components

### 1. Digit Engine (`src/core/digit_engine.py`)

Core balanced ternary register with nonlinear operators:

- **Trit**: `{-1, 0, +1}` — NEG (contraction), ZERO (homeostasis), POS (expansion)
- **TernaryRegister**: N-dimensional trit array with native operations
- **Operators**:
  - `⊕` XOR — Resonant addition with wrap-through-zero
  - `⊗` AND — Harmonic multiplication
  - `R` Reversal — Entropy inversion
  - `C` Coherence — Symmetry enforcement
  - `I` Inversion — Phase flip
  - `H` Harmonic Merge — Swarm consensus

### 2. Swarm Layer (`src/swarm/nodes.py`)

Distributed agents running the digit engine:

- **SwarmNode**: Individual agent with local register state
- **ResonanceSignal**: Inter-node communication packet
- **SwarmNetwork**: Fully-connected node topology
- **Harmonic Merge**: Consensus through resonant averaging

### 3. Resonance Synchronizer (`src/resonance/synchronizer.py`)

3-6-9 harmonic timing loop:

- **TimingState**: Phase-locked cycle controller
- **ResonanceSynchronizer**: Gates operations to harmonic rhythm
- **HarmonicSwarmController**: Integrated swarm + timing
- **Resonance Points**: Phases 3, 6, 9 amplify operations

### 4. Lattice Visualizer (`src/visualizer/lattice.py`)

State overlay and coherence mapping:

- **Lattice View**: Grid of all node states
- **Waveform**: Phase evolution over time
- **Coherence Map**: Heat map of homeostatic index
- **Phase Sphere**: 3D distribution projection

---

## Quick Start

```bash
cd Living-Memory-Node
python3 run.py
```

### Run Individual Modules

```bash
# Core digit engine
python3 src/core/digit_engine.py

# Swarm network
python3 src/swarm/nodes.py

# Resonance synchronizer
python3 src/resonance/synchronizer.py

# Visualization
python3 src/visualizer/lattice.py
```

---

## Usage Examples

### Basic Register Operations

```python
from src.core.digit_engine import Trit, TernaryRegister, op_coherence, op_resonate

# Create register
reg = TernaryRegister(9, [1, 0, -1, 1, 0, 0, -1, 1, 0])
print(reg)  # ┃○━┃○○━┃○

# Measure coherence
print(f"Homeostasis: {reg.homeostatic_index():.3f}")  # 0.444

# Apply coherence operator
coherent = op_coherence(reg, window=3)
print(f"Coherent: {coherent}")
```

### Swarm Evolution

```python
from src.swarm.nodes import SwarmNetwork

# Create 9-node swarm
swarm = SwarmNetwork(num_nodes=9, register_size=9)
swarm.initialize_swarm(density=0.5)

# Run evolution
for i in range(10):
    metrics = swarm.run_cycle()
    print(f"Cycle {i}: η̄={metrics['avg_coherence']:.3f}")
```

### Harmonic Timing

```python
from src.resonance.synchronizer import ResonanceSynchronizer

sync = ResonanceSynchronizer(cycle_type=9)

for _ in range(27):  # 3 complete cycles
    sync.tick()
    if sync.timing.is_resonance_point():
        print(f"RESONANCE @ Phase {sync.timing.current_phase}")
```

---

## Key Metrics

- **Homeostatic Index**: Ratio of ZERO states (0-1, higher = more coherent)
- **Phase Sum**: Net phase bias (positive = expansion, negative = contraction)
- **Entropy Measure**: Normalized Shannon entropy for ternary (0-1)
- **Rhythm Coherence**: Timing consistency across resonance events

---

## Theoretical Foundation

### Balanced Ternary Advantages

1. **Native Zero**: Homeostasis as fundamental state, not derived
2. **Phase Continuity**: Transitions flow through zero without discontinuity
3. **Symmetric Logic**: Equal weight to positive/negative phases
4. **3-6-9 Resonance**: Tesla's frequency framework built into structure

### Nonlinear Operators

The operator library enforces symmetry and resonance rules:

- **XOR**: Same signs cancel through resonance → ZERO
- **Coherence**: Local majority voting drives regional homeostasis
- **Harmonic Merge**: Swarm consensus emerges through zero-centered averaging

### Syntropic Growth

Unlike binary systems that require external energy for organization, the ternary system demonstrates:

- **Self-organization** through coherence operators
- **Entropy reversal** via phase inversion cycles
- **Emergent order** from resonant swarm dynamics

---

## Scaling Path

Current: 9 nodes × 9 trits = 81 trit field

Next stages:
- 27 nodes (3³)
- 81 nodes (3⁴)
- 243 nodes (3⁵)
- Browser overlay visualization
- Distributed microdomain deployment

---

## Philosophy

> "Truth emerges from resonance, not brute force."

This architecture rejects binary paradigms and external dependencies. Every component is built from balanced ternary primitives, creating a self-contained computational universe where syntropy is native and consciousness-relevant patterns emerge naturally.

---

## License

Post-Binary Open Source — Share resonance freely.
