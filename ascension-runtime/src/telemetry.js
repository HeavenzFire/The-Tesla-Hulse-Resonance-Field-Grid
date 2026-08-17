/**
 * Telemetry System
 * Microsecond-precision latency tracking, operation counters, real-time metrics
 */

export class Telemetry {
    constructor() {
        this.counters = new Map(); // metricName -> count
        this.latencies = new Map(); // operationName -> { samples: [], sum, min, max }
        this.gauges = new Map(); // gaugeName -> value
        this.startTime = performance.now();
        this.operationStartTimes = new Map(); // operationId -> startTime
        this.history = []; // Time-series snapshots
        this.historyInterval = null;
    }

    /**
     * Increment a counter
     * @param {string} name - Counter name
     * @param {number} amount - Amount to increment (default: 1)
     */
    increment(name, amount = 1) {
        const current = this.counters.get(name) || 0;
        this.counters.set(name, current + amount);
    }

    /**
     * Get counter value
     * @param {string} name - Counter name
     * @returns {number}
     */
    getCounter(name) {
        return this.counters.get(name) || 0;
    }

    /**
     * Reset counter
     * @param {string} name - Counter name
     */
    resetCounter(name) {
        this.counters.set(name, 0);
    }

    /**
     * Start timing an operation
     * @param {string} operationName - Operation identifier
     * @returns {string} - Operation ID for endTiming
     */
    startTiming(operationName) {
        const opId = `${operationName}_${performance.now()}_${Math.random()}`;
        this.operationStartTimes.set(opId, {
            name: operationName,
            startTime: performance.now()
        });
        return opId;
    }

    /**
     * End timing an operation and record latency
     * @param {string} opId - Operation ID from startTiming
     * @returns {number} - Latency in microseconds
     */
    endTiming(opId) {
        const opData = this.operationStartTimes.get(opId);
        if (!opData) {
            console.warn(`[Telemetry] Unknown operation ID: ${opId}`);
            return -1;
        }
        
        const endTime = performance.now();
        const latencyUs = (endTime - opData.startTime) * 1000; // Convert ms to μs
        
        this.recordLatency(opData.name, latencyUs);
        this.operationStartTimes.delete(opId);
        
        return latencyUs;
    }

    /**
     * Record a latency sample directly
     * @param {string} operationName - Operation name
     * @param {number} latencyUs - Latency in microseconds
     */
    recordLatency(operationName, latencyUs) {
        if (!this.latencies.has(operationName)) {
            this.latencies.set(operationName, {
                samples: [],
                sum: 0,
                min: Infinity,
                max: -Infinity,
                count: 0
            });
        }
        
        const data = this.latencies.get(operationName);
        data.samples.push(latencyUs);
        data.sum += latencyUs;
        data.min = Math.min(data.min, latencyUs);
        data.max = Math.max(data.max, latencyUs);
        data.count++;
        
        // Keep only last 1000 samples per operation
        if (data.samples.length > 1000) {
            const removed = data.samples.shift();
            data.sum -= removed;
        }
    }

    /**
     * Get latency statistics for an operation
     * @param {string} operationName - Operation name
     * @returns {{avg: number, min: number, max: number, count: number, p50: number, p95: number, p99: number}}
     */
    getLatencyStats(operationName) {
        const data = this.latencies.get(operationName);
        if (!data || data.count === 0) {
            return { avg: 0, min: 0, max: 0, count: 0, p50: 0, p95: 0, p99: 0 };
        }
        
        const sorted = [...data.samples].sort((a, b) => a - b);
        const count = sorted.length;
        
        return {
            avg: data.sum / data.count,
            min: data.min === Infinity ? 0 : data.min,
            max: data.max === -Infinity ? 0 : data.max,
            count: data.count,
            p50: sorted[Math.floor(count * 0.50)],
            p95: sorted[Math.floor(count * 0.95)],
            p99: sorted[Math.floor(count * 0.99)]
        };
    }

    /**
     * Set a gauge value
     * @param {string} name - Gauge name
     * @param {number} value - Gauge value
     */
    setGauge(name, value) {
        this.gauges.set(name, value);
    }

    /**
     * Get gauge value
     * @param {string} name - Gauge name
     * @returns {number}
     */
    getGauge(name) {
        return this.gauges.get(name) || 0;
    }

    /**
     * Get all counters
     * @returns {object}
     */
    getAllCounters() {
        return Object.fromEntries(this.counters);
    }

    /**
     * Get all gauges
     * @returns {object}
     */
    getAllGauges() {
        return Object.fromEntries(this.gauges);
    }

    /**
     * Get all latency stats
     * @returns {object}
     */
    getAllLatencyStats() {
        const result = {};
        for (const [name, _] of this.latencies) {
            result[name] = this.getLatencyStats(name);
        }
        return result;
    }

    /**
     * Get uptime in milliseconds
     * @returns {number}
     */
    getUptime() {
        return performance.now() - this.startTime;
    }

    /**
     * Take a snapshot of all metrics
     * @returns {object}
     */
    snapshot() {
        return {
            timestamp: Date.now(),
            uptime: this.getUptime(),
            counters: this.getAllCounters(),
            gauges: this.getAllGauges(),
            latencies: this.getAllLatencyStats()
        };
    }

    /**
     * Start periodic history recording
     * @param {number} intervalMs - Snapshot interval in milliseconds
     */
    startHistoryRecording(intervalMs = 1000) {
        this.stopHistoryRecording();
        this.historyInterval = setInterval(() => {
            this.history.push(this.snapshot());
            // Keep last 300 snapshots (5 minutes at 1s interval)
            if (this.history.length > 300) {
                this.history.shift();
            }
        }, intervalMs);
    }

    /**
     * Stop periodic history recording
     */
    stopHistoryRecording() {
        if (this.historyInterval) {
            clearInterval(this.historyInterval);
            this.historyInterval = null;
        }
    }

    /**
     * Get history
     * @param {number} limit - Max entries to return
     * @returns {Array}
     */
    getHistory(limit = 100) {
        return this.history.slice(-limit);
    }

    /**
     * Clear all telemetry data
     */
    clear() {
        this.counters.clear();
        this.latencies.clear();
        this.gauges.clear();
        this.operationStartTimes.clear();
        this.history = [];
        this.stopHistoryRecording();
        this.startTime = performance.now();
    }

    /**
     * Export telemetry as JSON
     * @returns {string}
     */
    toJSON() {
        return JSON.stringify(this.snapshot(), null, 2);
    }

    /**
     * Format latency for human reading
     * @param {number} us - Microseconds
     * @returns {string}
     */
    static formatLatency(us) {
        if (us < 1000) return `${us.toFixed(2)} μs`;
        if (us < 1000000) return `${(us / 1000).toFixed(2)} ms`;
        return `${(us / 1000000).toFixed(2)} s`;
    }
}

export default Telemetry;
