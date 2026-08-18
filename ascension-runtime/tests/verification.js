/**
 * Automated Verification Suite
 * Tests for all engine components: ternary ALU, topology, event bus, telemetry, kernel
 */

import { BalancedTernary } from '../src/balanced-ternary.js';
import { TopologyEngine } from '../src/topology.js';
import { EventBus } from '../src/event-bus.js';
import { Telemetry } from '../src/telemetry.js';
import { RuntimeKernel, LifecycleState } from '../src/kernel.js';
import { SovereignAscensionEngine } from '../src/engine.js';

const results = { passed: 0, failed: 0, tests: [] };

function test(name, fn) {
    try {
        const result = fn();
        if (result instanceof Promise) {
            return result.then(() => {
                results.passed++;
                results.tests.push({ name, status: 'PASSED' });
                console.log(`✓ ${name}`);
            }).catch((error) => {
                results.failed++;
                results.tests.push({ name, status: 'FAILED', error: error.message });
                console.error(`✗ ${name}: ${error.message}`);
            });
        } else {
            results.passed++;
            results.tests.push({ name, status: 'PASSED' });
            console.log(`✓ ${name}`);
        }
    } catch (error) {
        results.failed++;
        results.tests.push({ name, status: 'FAILED', error: error.message });
        console.error(`✗ ${name}: ${error.message}`);
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || `Assertion failed: ${condition}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

// ============================================
// BALANCED TERNARY TESTS
// ============================================

test('Ternary: normalize positive', () => {
    assertEqual(BalancedTernary.normalize(5), 1);
    assertEqual(BalancedTernary.normalize(0.001), 1);
});

test('Ternary: normalize negative', () => {
    assertEqual(BalancedTernary.normalize(-5), -1);
    assertEqual(BalancedTernary.normalize(-0.001), -1);
});

test('Ternary: normalize zero', () => {
    assertEqual(BalancedTernary.normalize(0), 0);
});

test('Ternary: NOT operation', () => {
    assertEqual(BalancedTernary.NOT(1), -1);
    assertEqual(BalancedTernary.NOT(-1), 1);
    assertEqual(BalancedTernary.NOT(0), 0);
});

test('Ternary: AND operation (Kleene logic)', () => {
    assertEqual(BalancedTernary.AND(1, 1), 1);
    assertEqual(BalancedTernary.AND(1, -1), -1);
    assertEqual(BalancedTernary.AND(-1, 1), -1);
    assertEqual(BalancedTernary.AND(-1, -1), -1);
    assertEqual(BalancedTernary.AND(1, 0), 0);
    assertEqual(BalancedTernary.AND(0, 1), 0);
    assertEqual(BalancedTernary.AND(-1, 0), -1); // FALSE AND UNKNOWN = FALSE
    assertEqual(BalancedTernary.AND(0, -1), -1);
    assertEqual(BalancedTernary.AND(0, 0), 0);
});

test('Ternary: OR operation (Kleene logic)', () => {
    assertEqual(BalancedTernary.OR(1, 1), 1);
    assertEqual(BalancedTernary.OR(1, -1), 1);
    assertEqual(BalancedTernary.OR(-1, 1), 1);
    assertEqual(BalancedTernary.OR(-1, -1), -1);
    assertEqual(BalancedTernary.OR(1, 0), 1); // TRUE OR UNKNOWN = TRUE
    assertEqual(BalancedTernary.OR(0, 1), 1);
    assertEqual(BalancedTernary.OR(-1, 0), 0);
    assertEqual(BalancedTernary.OR(0, -1), 0);
    assertEqual(BalancedTernary.OR(0, 0), 0);
});

test('Ternary: XOR operation', () => {
    assertEqual(BalancedTernary.XOR(1, 1), -1);
    assertEqual(BalancedTernary.XOR(1, -1), 1);
    assertEqual(BalancedTernary.XOR(-1, 1), 1);
    assertEqual(BalancedTernary.XOR(-1, -1), -1);
    assertEqual(BalancedTernary.XOR(1, 0), 0);
    assertEqual(BalancedTernary.XOR(0, 1), 0);
});

test('Ternary: NAND operation', () => {
    assertEqual(BalancedTernary.NAND(1, 1), -1);
    assertEqual(BalancedTernary.NAND(1, -1), 1);
    assertEqual(BalancedTernary.NAND(-1, 1), 1);
    assertEqual(BalancedTernary.NAND(-1, -1), 1);
});

test('Ternary: NOR operation', () => {
    assertEqual(BalancedTernary.NOR(1, 1), -1);
    assertEqual(BalancedTernary.NOR(1, -1), -1);
    assertEqual(BalancedTernary.NOR(-1, 1), -1);
    assertEqual(BalancedTernary.NOR(-1, -1), 1);
});

test('Ternary: vector operations', () => {
    const vec = BalancedTernary.vector([5, -3, 0, 2, -1]);
    assertEqual(vec.length, 5);
    assertEqual(vec[0], 1);
    assertEqual(vec[1], -1);
    assertEqual(vec[2], 0);
});

test('Ternary: countStates', () => {
    const counts = BalancedTernary.countStates([1, 1, -1, 0, 1, -1, -1]);
    assertEqual(counts.positive, 3);
    assertEqual(counts.negative, 3);
    assertEqual(counts.zero, 1);
});

test('Ternary: entropy calculation', () => {
    // Uniform distribution should have max entropy log2(3) ≈ 1.585
    const uniform = [1, -1, 0, 1, -1, 0];
    const entropy = BalancedTernary.entropy(uniform);
    assert(entropy > 1.5 && entropy < 1.6, `Entropy out of range: ${entropy}`);
    
    // Single state should have 0 entropy
    const single = [1, 1, 1, 1];
    assertEqual(BalancedTernary.entropy(single), 0);
});

// ============================================
// TOPOLOGY ENGINE TESTS
// ============================================

test('Topology: add and get nodes', () => {
    const topo = new TopologyEngine();
    topo.addNode('A', { value: 1 });
    topo.addNode('B', { value: 2 });
    assertEqual(topo.nodes.size, 2);
});

test('Topology: add edges', () => {
    const topo = new TopologyEngine();
    topo.addEdge('A', 'B', 5);
    assertEqual(topo.edgeCount, 1);
    const neighbors = topo.getNeighbors('A');
    assertEqual(neighbors.length, 1);
    assertEqual(neighbors[0].id, 'B');
    assertEqual(neighbors[0].weight, 5);
});

test('Topology: BFS path finding', () => {
    const topo = new TopologyEngine();
    topo.addEdge('A', 'B');
    topo.addEdge('B', 'C');
    topo.addEdge('C', 'D');
    
    const result = topo.findPathBFS('A', 'D');
    assert(result.found, 'Path not found');
    assertEqual(result.path.length, 4);
    assertEqual(result.path[0], 'A');
    assertEqual(result.path[3], 'D');
});

test('Topology: Dijkstra shortest path', () => {
    const topo = new TopologyEngine();
    topo.addEdge('A', 'B', 10);
    topo.addEdge('A', 'C', 1);
    topo.addEdge('C', 'B', 1);
    
    const result = topo.findPathDijkstra('A', 'B');
    assert(result.found, 'Path not found');
    assertEqual(result.distance, 2); // A -> C -> B
    assertEqual(result.path[1], 'C');
});

test('Topology: degree centrality', () => {
    const topo = new TopologyEngine();
    topo.addEdge('A', 'B');
    topo.addEdge('A', 'C');
    topo.addEdge('A', 'D');
    topo.addEdge('B', 'C');
    
    const centrality = topo.degreeCentrality();
    assert(centrality.get('A') > centrality.get('B'), 'A should have higher centrality');
});

test('Topology: connectivity check', () => {
    const topo = new TopologyEngine();
    topo.addEdge('A', 'B');
    topo.addEdge('B', 'C');
    assert(topo.isConnected(), 'Graph should be connected');
    
    topo.addEdge('D', 'E');
    assert(!topo.isConnected(), 'Graph should be disconnected');
});

test('Topology: graph stats', () => {
    const topo = new TopologyEngine();
    topo.addEdge('A', 'B');
    topo.addEdge('B', 'C');
    topo.addEdge('C', 'A');
    
    const stats = topo.getStats();
    assertEqual(stats.nodes, 3);
    assertEqual(stats.edges, 3);
    assert(stats.density > 0 && stats.density <= 1);
    assert(stats.connected);
});

// ============================================
// EVENT BUS TESTS
// ============================================

test('EventBus: subscribe and publish', (done) => {
    const bus = new EventBus();
    let received = false;
    
    bus.subscribe('test-topic', (payload) => {
        assertEqual(payload.value, 42);
        received = true;
    });
    
    bus.publish('test-topic', { value: 42 });
    assert(received, 'Event not received');
});

test('EventBus: unsubscribe', () => {
    const bus = new EventBus();
    let callCount = 0;
    
    const subId = bus.subscribe('topic', () => { callCount++; });
    bus.publish('topic', {});
    assertEqual(callCount, 1);
    
    bus.unsubscribe('topic', subId);
    bus.publish('topic', {});
    assertEqual(callCount, 1, 'Should not receive after unsubscribe');
});

test('EventBus: priority ordering', () => {
    const bus = new EventBus();
    const order = [];
    
    bus.subscribe('prio-test', () => order.push(3), 1);
    bus.subscribe('prio-test', () => order.push(1), 3);
    bus.subscribe('prio-test', () => order.push(2), 2);
    
    bus.publish('prio-test', {});
    assertEqual(order[0], 1, 'Highest priority should execute first');
    assertEqual(order[1], 2);
    assertEqual(order[2], 3);
});

test('EventBus: pause and resume', () => {
    const bus = new EventBus();
    let received = false;
    
    bus.subscribe('pause-test', () => { received = true; });
    bus.pause();
    bus.publish('pause-test', {});
    assert(!received, 'Should not receive while paused');
    
    bus.resume(true);
    assert(received, 'Should receive after resume');
});

test('EventBus: event replay', () => {
    const bus = new EventBus();
    const events = [];
    
    bus.subscribe('replay', (p) => events.push(p));
    bus.publish('replay', { seq: 1 });
    bus.publish('replay', { seq: 2 });
    bus.publish('replay', { seq: 3 });
    
    // Clear and replay
    events.length = 0;
    bus.replay(2, 3);
    assertEqual(events.length, 2);
    assertEqual(events[0].seq, 2);
    assertEqual(events[1].seq, 3);
});

// ============================================
// TELEMETRY TESTS
// ============================================

test('Telemetry: counter operations', () => {
    const tel = new Telemetry();
    tel.increment('requests');
    tel.increment('requests', 5);
    assertEqual(tel.getCounter('requests'), 6);
    
    tel.resetCounter('requests');
    assertEqual(tel.getCounter('requests'), 0);
});

test('Telemetry: latency tracking', () => {
    const tel = new Telemetry();
    tel.recordLatency('op', 100);
    tel.recordLatency('op', 200);
    tel.recordLatency('op', 300);
    
    const stats = tel.getLatencyStats('op');
    assertEqual(stats.count, 3);
    assertEqual(stats.min, 100);
    assertEqual(stats.max, 300);
    assertEqual(stats.avg, 200);
});

test('Telemetry: timing operations', async () => {
    const tel = new Telemetry();
    const opId = tel.startTiming('async-op');
    await new Promise(r => setTimeout(r, 10));
    const latency = tel.endTiming(opId);
    
    assert(latency >= 9000, `Latency too low: ${latency} μs`); // 9ms = 9000μs
});

test('Telemetry: gauge operations', () => {
    const tel = new Telemetry();
    tel.setGauge('temperature', 25.5);
    assertEqual(tel.getGauge('temperature'), 25.5);
    
    tel.setGauge('temperature', 30.0);
    assertEqual(tel.getGauge('temperature'), 30.0);
});

test('Telemetry: snapshot', () => {
    const tel = new Telemetry();
    tel.increment('events', 10);
    tel.setGauge('level', 5);
    tel.recordLatency('op', 100);
    
    const snap = tel.snapshot();
    assert(snap.uptime >= 0);
    assertEqual(snap.counters.events, 10);
    assertEqual(snap.gauges.level, 5);
});

// ============================================
// KERNEL TESTS
// ============================================

test('Kernel: lifecycle transitions', async () => {
    const kernel = new RuntimeKernel();
    assertEqual(kernel.state, LifecycleState.UNINITIALIZED);
    
    await kernel.initialize();
    assertEqual(kernel.state, LifecycleState.RUNNING);
    
    await kernel.stop();
    assertEqual(kernel.state, LifecycleState.STOPPED);
});

test('Kernel: module registration', async () => {
    const kernel = new RuntimeKernel();
    await kernel.initialize();
    
    kernel.registerModule('test-mod', {
        async start() { this.started = true; },
        async stop() { this.started = false; }
    }, [], ['test-cap']);
    
    const mod = kernel.getModule('test-mod');
    assert(mod, 'Module not found');
    
    const byCap = kernel.getModuleByCapability('test-cap');
    assertEqual(byCap, mod);
    
    await kernel.stop();
});

test('Kernel: module dependency ordering', async () => {
    const kernel = new RuntimeKernel();
    await kernel.initialize();
    
    const startOrder = [];
    
    kernel.registerModule('mod-a', {
        async start() { startOrder.push('a'); }
    }, [], []);
    
    kernel.registerModule('mod-b', {
        async start() { startOrder.push('b'); }
    }, ['mod-a'], []);
    
    kernel.registerModule('mod-c', {
        async start() { startOrder.push('c'); }
    }, ['mod-b'], []);
    
    await kernel.startModules();
    assertEqual(startOrder[0], 'a');
    assertEqual(startOrder[1], 'b');
    assertEqual(startOrder[2], 'c');
    
    await kernel.stop();
});

// ============================================
// FULL ENGINE TESTS
// ============================================

test('Engine: initialize and start', async () => {
    const engine = new SovereignAscensionEngine();
    await engine.initialize();
    await engine.start();
    
    const status = engine.getStatus();
    assertEqual(status.engine.version, 'v18433');
    assertEqual(status.engine.frequency, 18432);
    assertEqual(status.engine.state, LifecycleState.RUNNING);
    
    await engine.stop();
});

test('Engine: ternary execution with telemetry', async () => {
    const engine = new SovereignAscensionEngine();
    await engine.initialize();
    await engine.start();
    
    const result = engine.executeTernary('AND', 1, -1);
    assertEqual(result, -1);
    
    const ops = engine.executeTernary('vector', [1, 0, -1, 5, -5]);
    assertEqual(ops.length, 5);
    
    const telem = engine.getTelemetry();
    // Check that operations counter exists and is >= 2
    const ternaryOps = telem.counters['ternary.operations'] || 0;
    assert(ternaryOps >= 2, `Expected at least 2 ternary ops, got ${ternaryOps}`);
    
    await engine.stop();
});

test('Engine: topology operations', async () => {
    const engine = new SovereignAscensionEngine();
    await engine.initialize();
    await engine.start();
    
    engine.addTopologyNode('X', { type: 'custom' });
    engine.addTopologyNode('Y', { type: 'custom' });
    engine.addTopologyEdge('X', 'Y', 7);
    
    const path = engine.findPath('X', 'Y');
    assert(path.found, 'Path not found');
    
    await engine.stop();
});

test('Engine: benchmark run', async () => {
    const engine = new SovereignAscensionEngine();
    await engine.initialize();
    await engine.start();
    
    const bench = await engine.runBenchmark(1000);
    assert(bench.iterations === 1000);
    assert(bench.opsPerSecond > 0);
    console.log(`  Benchmark: ${bench.opsPerSecond.toFixed(0)} ops/sec`);
    
    await engine.stop();
});

// ============================================
// RUN ALL TESTS
// ============================================

console.log('\n========================================');
console.log('ASCENSION RUNTIME v18433 - VERIFICATION');
console.log('========================================\n');

// Run all synchronous tests immediately
// Async tests are handled within the test function

setTimeout(() => {
    console.log('\n========================================');
    console.log(`RESULTS: ${results.passed} passed, ${results.failed} failed`);
    console.log('========================================\n');
    
    if (results.failed > 0) {
        console.log('Failed tests:');
        for (const t of results.tests) {
            if (t.status === 'FAILED') {
                console.log(`  - ${t.name}: ${t.error}`);
            }
        }
        process.exit(1);
    } else {
        console.log('All tests passed! ✓\n');
        process.exit(0);
    }
}, 500);
