"""
Test Suite for Syntropic Engine
Validates unitarity, zero-allocation patterns, and constructive resonance.
License: AGPL-3.0
"""

import unittest
import numpy as np
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
from syntropic import SyntropicEngine


class TestUnitarity(unittest.TestCase):
    """Verify strict unitarity preservation (drift < 1e-14)."""
    
    def test_drift_bound(self):
        engine = SyntropicEngine(n_states=512, seed=42)
        _, metrics = engine.run_evolution(steps=1000, theta=0.01)
        
        # Drift must stay below 1e-14 threshold
        self.assertLess(metrics['max_drift'], 1e-14, 
            f"Drift {metrics['max_drift']} exceeds unitarity bound 1e-14")
    
    def test_norm_preservation(self):
        engine = SyntropicEngine(n_states=256, seed=123)
        state, _ = engine.run_evolution(steps=500, theta=0.005)
        
        # Final norm should be 1.0 within floating point precision
        final_norm = np.linalg.norm(state)
        self.assertAlmostEqual(final_norm, 1.0, places=10,
            msg=f"Final norm {final_norm} deviates from unity")


class TestZeroAllocation(unittest.TestCase):
    """Verify zero-allocation reuse patterns."""
    
    def test_buffer_reuse(self):
        engine = SyntropicEngine(n_states=1024, seed=42)
        
        # Capture buffer IDs before operation
        state_buf_id = id(engine.state_buffer)
        temp_buf_id = id(engine.temp_buffer)
        
        # Run operation
        initial_state = np.ones(1024, dtype=np.complex128) / np.sqrt(1024)
        _ = engine.apply_phase_operation(initial_state, 0.01)
        
        # Buffer IDs should remain unchanged (no reallocation)
        self.assertEqual(id(engine.state_buffer), state_buf_id,
            "State buffer was reallocated")
        self.assertEqual(id(engine.temp_buffer), temp_buf_id,
            "Temp buffer was reallocated")


class TestConstructiveResonance(unittest.TestCase):
    """Verify synergistic gain from combined optimizations."""
    
    def test_resonance_factor(self):
        engine = SyntropicEngine(n_states=2048, seed=42)
        _, metrics = engine.run_evolution(steps=5000, theta=0.005)
        
        # Resonance factor should exceed 1.2 (20% synergistic gain)
        self.assertGreater(metrics['constructive_resonance_factor'], 1.2,
            f"Resonance factor {metrics['constructive_resonance_factor']} indicates additive behavior")
    
    def test_throughput_scaling(self):
        """Throughput should scale with N on commodity hardware."""
        small_engine = SyntropicEngine(n_states=512, seed=42)
        large_engine = SyntropicEngine(n_states=2048, seed=42)
        
        _, small_metrics = small_engine.run_evolution(steps=2000, theta=0.01)
        _, large_metrics = large_engine.run_evolution(steps=2000, theta=0.01)
        
        # Larger state space should maintain or improve ops/sec due to cache effects
        # (This is a simplified check; real benchmarking requires statistical analysis)
        self.assertGreater(large_metrics['operations_per_second'], 
                          small_metrics['operations_per_second'] * 0.5,
                          "Throughput scaling degraded unexpectedly")


class TestReproducibility(unittest.TestCase):
    """Verify deterministic reproducibility with seeded runs."""
    
    def test_deterministic_output(self):
        engine1 = SyntropicEngine(n_states=256, seed=42)
        engine2 = SyntropicEngine(n_states=256, seed=42)
        
        state1, metrics1 = engine1.run_evolution(steps=100, theta=0.01)
        state2, metrics2 = engine2.run_evolution(steps=100, theta=0.01)
        
        # Identical seeds must produce identical results
        np.testing.assert_array_almost_equal(state1, state2, decimal=15,
            err_msg="Seeded runs produced different states")
        self.assertEqual(metrics1['max_drift'], metrics2['max_drift'],
            msg="Seeded runs produced different drift metrics")


if __name__ == '__main__':
    unittest.main(verbosity=2)
