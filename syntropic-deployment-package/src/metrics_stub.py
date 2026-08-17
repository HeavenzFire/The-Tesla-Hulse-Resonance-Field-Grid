"""
Metrics Stub for Syntropic Engine
Placeholder for advanced metrics collection (entropy, parallel scaling, feedback loops).
License: AGPL-3.0
"""

from typing import Dict, List, Optional
import numpy as np


class MetricsCollector:
    """
    Collects and aggregates metrics for syntropic operations.
    Supports entropy tracking, parallel efficiency, and feedback quantification.
    """
    
    def __init__(self):
        self.metrics_history: List[Dict] = []
        
    def record(
        self,
        operation_id: str,
        throughput: float,
        latency_ms: float,
        drift: float,
        resonance_factor: float,
        entropy: Optional[float] = None,
        parallel_efficiency: Optional[float] = None
    ) -> None:
        """Record a single operation's metrics."""
        entry = {
            "operation_id": operation_id,
            "throughput_ops_sec": throughput,
            "latency_ms": latency_ms,
            "drift": drift,
            "resonance_factor": resonance_factor,
            "entropy": entropy,
            "parallel_efficiency": parallel_efficiency
        }
        self.metrics_history.append(entry)
    
    def get_aggregate_stats(self) -> Dict:
        """Calculate aggregate statistics across all recorded metrics."""
        if not self.metrics_history:
            return {"count": 0}
        
        throughputs = [m["throughput_ops_sec"] for m in self.metrics_history]
        latencies = [m["latency_ms"] for m in self.metrics_history]
        drifts = [m["drift"] for m in self.metrics_history]
        resonances = [m["resonance_factor"] for m in self.metrics_history]
        
        return {
            "total_operations": len(self.metrics_history),
            "avg_throughput": np.mean(throughputs),
            "std_throughput": np.std(throughputs),
            "min_throughput": min(throughputs),
            "max_throughput": max(throughputs),
            
            "avg_latency_ms": np.mean(latencies),
            "p99_latency_ms": np.percentile(latencies, 99),
            
            "avg_drift": np.mean(drifts),
            "max_drift": max(drifts),
            "unitarity_pass_rate": sum(1 for d in drifts if d < 1e-14) / len(drifts),
            
            "avg_resonance_factor": np.mean(resonances),
            "synergistic_gain_confirmed": np.mean(resonances) > 1.2
        }
    
    def calculate_entropy_curve(self) -> List[float]:
        """
        Calculate population entropy over time.
        Used to detect premature convergence in evolutionary runs.
        """
        # Placeholder: In full implementation, track state distribution entropy
        # For now, return synthetic curve showing entropy maintenance
        return [1.0 - (i * 0.001) for i in range(len(self.metrics_history))]
    
    def calculate_parallel_scaling(
        self, 
        worker_counts: List[int], 
        throughputs: List[float]
    ) -> Dict:
        """
        Calculate parallel speedup Sp and efficiency Ep.
        Sp = T1 / Tp
        Ep = Sp / p
        """
        if len(worker_counts) != len(throughputs) or len(worker_counts) == 0:
            return {"error": "Invalid input"}
        
        t1 = throughputs[0]  # Baseline throughput with 1 worker
        scaling_results = []
        
        for i, (p, tp) in enumerate(zip(worker_counts, throughputs)):
            speedup = tp / t1 if t1 > 0 else 0
            efficiency = speedup / p if p > 0 else 0
            scaling_results.append({
                "workers": p,
                "throughput": tp,
                "speedup": round(speedup, 3),
                "efficiency": round(efficiency, 3)
            })
        
        return {
            "scaling_curve": scaling_results,
            "avg_efficiency": np.mean([r["efficiency"] for r in scaling_results]),
            "linear_scaling_deviation": abs(1.0 - np.mean([r["efficiency"] for r in scaling_results]))
        }


def generate_mock_metrics() -> MetricsCollector:
    """Generate synthetic metrics for visualization/demonstration."""
    collector = MetricsCollector()
    
    # Simulate 100 operations with realistic variance
    np.random.seed(42)
    for i in range(100):
        base_throughput = 45_000_000
        throughput = base_throughput * (1 + np.random.normal(0, 0.05))
        latency = 1000 / (throughput / 1_000_000)  # ms
        drift = np.random.uniform(1e-16, 5e-15)
        resonance = np.random.uniform(1.15, 1.35)
        entropy = 1.0 - (i * 0.002) + np.random.uniform(-0.05, 0.05)
        
        collector.record(
            operation_id=f"op_{i:04d}",
            throughput=throughput,
            latency_ms=latency,
            drift=drift,
            resonance_factor=resonance,
            entropy=max(0.1, entropy),
            parallel_efficiency=0.92 + np.random.uniform(-0.05, 0.05)
        )
    
    return collector


if __name__ == "__main__":
    print("Generating mock metrics for visualization...")
    collector = generate_mock_metrics()
    
    stats = collector.get_aggregate_stats()
    print("\n[AGGREGATE STATISTICS]")
    for key, value in stats.items():
        if isinstance(value, float):
            print(f"{key}: {value:.6f}")
        else:
            print(f"{key}: {value}")
    
    print("\n[ENTROPY CURVE SAMPLE]")
    entropy_curve = collector.calculate_entropy_curve()[:10]
    print(f"First 10 entropy values: {[round(e, 4) for e in entropy_curve]}")
    
    print("\n[PARALLEL SCALING EXAMPLE]")
    scaling = collector.calculate_parallel_scaling(
        worker_counts=[1, 2, 4, 8, 16],
        throughputs=[45e6, 88e6, 172e6, 330e6, 620e6]
    )
    for row in scaling["scaling_curve"]:
        print(f"Workers={row['workers']:2d} | Throughput={row['throughput']/1e6:6.1f}M | Speedup={row['speedup']:.2f}x | Efficiency={row['efficiency']:.2%}")
