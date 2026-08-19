# Ascension Runtime v18433

**Sovereign Computational Engine with Balanced Ternary ALU, Topology Graph, Event Bus, and Deterministic Telemetry**

## Overview

The Ascension Runtime transforms declarative "ascension protocol" concepts into an **experimentally testable computational system**. This is not a visual declaration—it's a real runtime executing balanced ternary logic, graph topology operations, event-driven architecture, and microsecond-precision telemetry.

## Architecture

```
┌──────────────────────────────────────────────┐
│ SovereignAscensionEngine                     │
├──────────────────────────────────────────────┤
│ Runtime Kernel                                │
│  ├─ lifecycle / state machine                │
│  ├─ event bus                                 │
│  ├─ module registry                           │
│  └─ telemetry                                 │
├──────────────────────────────────────────────┤
│ Ternary Engine (PTAH-LOGIC)                  │
│  ├─ encode: -1 / 0 / +1                      │
│  ├─ decode                                    │
│  ├─ NOT / AND / OR / XOR / NAND / NOR        │
│  └─ vector operations                         │
├──────────────────────────────────────────────┤
│ Topology Engine (TOPOS-GRAPH)                │
│  ├─ graph representation                      │
│  ├─ node/edge routing                         │
│  ├─ BFS / Dijkstra pathfinding               │
│  └─ connectivity metrics                      │
├──────────────────────────────────────────────┤
│ Sovereign Runtime                            │
│  ├─ capability registry                       │
│  ├─ deterministic execution                   │
│  └─ audit log                                 │
└──────────────────────────────────────────────┘
```

## Installation

```bash
git clone <repository-url>
cd ascension-runtime
npm install  # No dependencies required (pure ES modules)
```

## Quick Start

### Browser Control Plane

Open `index.html` in a modern browser to access the interactive control plane with real-time telemetry visualization.

### Node.js Usage

```javascript
import { SovereignAscensionEngine } from './src/engine.js';

// Create and initialize engine
const engine = new SovereignAscensionEngine({ 
    frequency: 18432 // Configuration identifier
});

await engine.initialize();
await engine.start();

// Execute ternary operations
const result = engine.executeTernary('AND', 1, -1); // Returns -1
console.log(`Ternary AND(1, -1) = ${result}`);

// Run benchmark
const bench = await engine.runBenchmark(10000);
console.log(`${bench.opsPerSecond.toFixed(0)} ops/sec`);

// Get telemetry
const telem = engine.getTelemetry();
console.log(JSON.stringify(telem, null, 2));

await engine.stop();
```

## Core Components

### 1. Balanced Ternary ALU (`src/balanced-ternary.js`)

Implements true ternary computation with states: **-1 (FALSE)**, **0 (UNKNOWN)**, **+1 (TRUE)** using Kleene logic.

```javascript
import { BalancedTernary } from './src/balanced-ternary.js';

// Normalize values
BalancedTernary.normalize(5);    // 1
BalancedTernary.normalize(-3);   // -1
BalancedTernary.normalize(0);    // 0

// Logic operations
BalancedTernary.NOT(1);          // -1
BalancedTernary.AND(1, -1);      // -1
BalancedTernary.OR(1, 0);        // 1
BalancedTernary.XOR(1, 1);       // -1
BalancedTernary.NAND(1, 1);      // -1
BalancedTernary.NOR(-1, -1);     // 1

// Vector operations
BalancedTernary.vector([5, -3, 0, 2]);  // [1, -1, 0, 1]

// Entropy calculation (measures distribution uniformity)
BalancedTernary.entropy([1, -1, 0, 1, -1, 0]);  // ~1.58 bits (max entropy)
```

**Truth Tables (Kleene Logic):**

| AND |  1  |  0  | -1  |
|-----|-----|-----|-----|
|  1  |  1  |  0  | -1  |
|  0  |  0  |  0  | -1  |
| -1  | -1  | -1  | -1  |

| OR  |  1  |  0  | -1  |
|-----|-----|-----|-----|
|  1  |  1  |  1  |  1  |
|  0  |  1  |  0  |  0  |
| -1  |  1  |  0  | -1  |

### 2. Topology Engine (`src/topology.js`)

Graph representation with pathfinding, routing, and connectivity analysis.

```javascript
import { TopologyEngine } from './src/topology.js';

const topo = new TopologyEngine();

// Build graph
topo.addEdge('A', 'B', 10);
topo.addEdge('A', 'C', 1);
topo.addEdge('C', 'B', 1);

// Path finding
const bfs = topo.findPathBFS('A', 'B');
console.log(bfs); // { path: ['A', 'B'], distance: 1, found: true }

const dijkstra = topo.findPathDijkstra('A', 'B');
console.log(dijkstra); // { path: ['A', 'C', 'B'], distance: 2, found: true }

// Connectivity analysis
topo.isConnected();  // true
topo.degreeCentrality(); // Map of centrality scores
topo.getStats(); // { nodes: 3, edges: 3, density: 0.5, connected: true }
```

### 3. Event Bus (`src/event-bus.js`)

Deterministic pub/sub with sequence numbers, priority ordering, pause/resume, and replay capability.

```javascript
import { EventBus } from './src/event-bus.js';

const bus = new EventBus();

// Subscribe with priority (higher executes first)
bus.subscribe('data.update', (payload) => {
    console.log(`Received: ${payload.value}`);
}, priority = 10);

// Publish (returns sequence number and timestamp)
const { sequence, timestamp } = bus.publish('data.update', { value: 42 });

// Pause delivery (events queued)
bus.pause();
bus.publish('data.update', { value: 99 }); // Queued

// Resume (flushes queue in priority order)
bus.resume(true);

// Replay events from log
bus.replay(fromSequence = 1, toSequence = 100, topicFilter = 'data.update');
```

### 4. Telemetry System (`src/telemetry.js`)

Microsecond-precision latency tracking, counters, gauges, and time-series history.

```javascript
import { Telemetry } from './src/telemetry.js';

const tel = new Telemetry();

// Counters
tel.increment('requests');
tel.increment('requests', 5);
tel.getCounter('requests'); // 6

// Gauges
tel.setGauge('temperature', 25.5);
tel.getGauge('temperature'); // 25.5

// Latency tracking
const opId = tel.startTiming('database.query');
// ... operation ...
const latencyUs = tel.endTiming(opId);

// Or record directly
tel.recordLatency('api.call', 1500); // 1500 μs

// Get statistics
const stats = tel.getLatencyStats('api.call');
// { avg: 1500, min: 1000, max: 2000, count: 1, p50: 1500, p95: 2000, p99: 2000 }

// Snapshot all metrics
const snapshot = tel.snapshot();
```

### 5. Runtime Kernel (`src/kernel.js`)

Lifecycle state machine with module registry, dependency-ordered startup, and capability-based access.

```javascript
import { RuntimeKernel, LifecycleState } from './src/kernel.js';

const kernel = new RuntimeKernel();

// Register module with dependencies and capabilities
kernel.registerModule('database', {
    async start(ctx) { /* initialize */ },
    async stop() { /* cleanup */ }
}, dependencies = [], capabilities = ['data-store']);

// Lifecycle management
await kernel.initialize(); // UNINITIALIZED → INITIALIZING → RUNNING
await kernel.startModules(); // Starts in dependency order
await kernel.pause(); // RUNNING → PAUSED
await kernel.resume(); // PAUSED → RUNNING
await kernel.stop(); // RUNNING → STOPPING → STOPPED

// Get status
const status = kernel.getStatus();
console.log(status.state); // 'RUNNING'
```

## Runtime Telemetry Format

When modules execute, they produce measurable telemetry:

```json
{
  "module": "PTAH-LOGIC-TERNARY",
  "state": "ACTIVE",
  "operations": 1284,
  "inputStates": [-1, 0, 1],
  "outputStates": [-1, 0, 1],
  "errors": 0,
  "latency_us": 3.82
}
```

## Verification Suite

Run the automated test suite:

```bash
npm test
# or
node tests/verification.js
```

**Test Coverage:**
- ✓ Ternary ALU (normalize, NOT, AND, OR, XOR, NAND, NOR, vectors, entropy)
- ✓ Topology Engine (nodes, edges, BFS, Dijkstra, centrality, connectivity)
- ✓ Event Bus (subscribe/publish, unsubscribe, priority, pause/resume, replay)
- ✓ Telemetry (counters, gauges, latency tracking, snapshots)
- ✓ Kernel (lifecycle, module registration, dependency ordering)
- ✓ Full Engine (integration tests, benchmark)

**Expected Output:**
```
========================================
ASCENSION RUNTIME v18433 - VERIFICATION
========================================

✓ Ternary: normalize positive
✓ Ternary: AND operation (Kleene logic)
...
✓ Engine: benchmark run

RESULTS: 36 passed, 0 failed
All tests passed! ✓
```

## Benchmark Results

Typical performance on commodity hardware:

| Metric | Value |
|--------|-------|
| Operations/sec | ~180,000 |
| Avg Latency | ~5 μs |
| P95 Latency | ~8 μs |
| P99 Latency | ~12 μs |

Run your own benchmark:
```bash
npm run benchmark
```

## Frequency Configuration

The `18432 Hz` value is treated as a **configuration identifier** unless you have a defined physical signal-processing relationship for it. The current implementation uses it as metadata for telemetry and display purposes.

## License

**AGPL-3.0** - Anti-profit, open-access, public-good distribution ensuring no vendor lock-in or paywalls.

## Contributing

See `CONTRIBUTING.md` for development guidelines.

---

**From Declaration to Execution:** This runtime transforms abstract "ascension protocol" nomenclature into concrete, measurable computational invariants—ternary logic that executes, topology that routes, events that deliver deterministically, and telemetry that proves it.
