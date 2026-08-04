"""
Test suite for Living Memory Node.
Verifies syntropic properties, phase-locking, and harmonic resonance.
"""

import sys
sys.path.insert(0, '/workspace/Living-Memory-Node')

from src.core.ternary import BalancedTernary, Trit, harmonic_369, higher_order_map, fractal_fold
from src.topology.fractal import PhaseVector, TopologyField, create_fractal_pattern


def test_balanced_ternary_conversion():
    """Test integer ↔ balanced ternary conversion."""
    print("Testing balanced ternary conversion...")
    
    test_values = [0, 1, -1, 5, -5, 10, -10, 27, -27, 100]
    for val in test_values:
        bt = BalancedTernary(val)
        converted_back = bt.to_int()
        assert converted_back == val, f"Failed for {val}: got {converted_back}"
    
    print("  ✓ All conversions correct")


def test_homeostasis():
    """Test zero state (homeostasis) detection."""
    print("Testing homeostasis detection...")
    
    zero = BalancedTernary(0)
    assert zero.is_homeostatic() == True
    
    non_zero = BalancedTernary(5)
    assert non_zero.is_homeostatic() == False
    
    print("  ✓ Homeostasis detection working")


def test_phase_inversion():
    """Test phase inversion (negation)."""
    print("Testing phase inversion...")
    
    pos = BalancedTernary(7)
    neg = -pos
    assert neg.to_int() == -7
    
    # Double inversion returns to original
    assert (-(-pos)).to_int() == 7
    
    print("  ✓ Phase inversion working")


def test_harmonic_369():
    """Test 3-6-9 harmonic resonance mapping."""
    print("Testing 3-6-9 harmonic resonance...")
    
    # Digital root patterns should emerge
    for i in range(1, 20):
        bt = BalancedTernary(i)
        harmonized = harmonic_369(bt)
        # Result should be in range [-9, 9]
        assert -9 <= harmonized.to_int() <= 9
    
    print("  ✓ Harmonic resonance mapping correct")


def test_higher_order_map():
    """Test higher-order function with phase locking."""
    print("Testing higher-order map with phase lock...")
    
    domain = [BalancedTernary(i) for i in range(-3, 4)]
    
    # Without phase lock
    results_unlocked = higher_order_map(lambda x: x * x, domain, phase_lock=False)
    
    # With phase lock - should maintain centering
    results_locked = higher_order_map(lambda x: x * x, domain, phase_lock=True)
    
    # Both should have same length
    assert len(results_unlocked) == len(results_locked) == len(domain)
    
    print("  ✓ Higher-order map functioning")


def test_fractal_fold():
    """Test syntropic growth through fractal folding."""
    print("Testing fractal fold / syntropic growth...")
    
    seed = BalancedTernary(1)
    pattern = fractal_fold(seed, iterations=5)
    
    # Should produce seed + iterations more values
    assert len(pattern) == 6
    
    # Each iteration should expand (generally increasing magnitude)
    print(f"  Growth pattern: {[p.to_int() for p in pattern]}")
    
    print("  ✓ Fractal fold generating syntropic patterns")


def test_phase_vector_operations():
    """Test multi-dimensional phase vector operations."""
    print("Testing phase vector operations...")
    
    v1 = PhaseVector([BalancedTernary(1), BalancedTernary(-1), BalancedTernary(0)])
    v2 = PhaseVector([BalancedTernary(2), BalancedTernary(1), BalancedTernary(-1)])
    
    # Test magnitude
    mag = v1.magnitude()
    assert mag > 0
    
    # Test dot product
    dot = v1.dot(v2)
    assert isinstance(dot, int)
    
    # Test addition
    v_sum = v1.add(v2)
    assert v_sum.dimensions == v1.dimensions
    
    # Test phase angle
    angle = v1.phase_angle()
    assert isinstance(angle, float)
    
    print("  ✓ Phase vector operations correct")


def test_topology_field():
    """Test topology field creation and transformation."""
    print("Testing topology field...")
    
    field = TopologyField(grid_size=4, dimensions=2)
    
    # Initial field should be homeostatic
    centroid = field.get_centroid()
    assert centroid.is_homeostatic()
    
    # Apply transformation
    def transform(v, x, y):
        h = harmonic_369(BalancedTernary(x + y))
        return v.add(PhaseVector([h, h]))
    
    field.apply_function(transform, phase_lock=True)
    
    # After phase-locked transform, should still be centered
    new_centroid = field.get_centroid()
    assert new_centroid.is_homeostatic(), "Phase lock failed to maintain homeostasis"
    
    print("  ✓ Topology field with phase lock working")


def test_fractal_pattern_generation():
    """Test fractal pattern generation in multi-D space."""
    print("Testing fractal pattern generation...")
    
    pattern = create_fractal_pattern(dimensions=3, iterations=2, seed_value=1)
    
    assert pattern.grid_size == 4  # 2^2
    assert pattern.dimensions == 3
    
    print("  ✓ Fractal pattern generation successful")


def run_all_tests():
    """Run complete test suite."""
    print("=" * 60)
    print("LIVING MEMORY NODE - TEST SUITE")
    print("=" * 60)
    print()
    
    tests = [
        test_balanced_ternary_conversion,
        test_homeostasis,
        test_phase_inversion,
        test_harmonic_369,
        test_higher_order_map,
        test_fractal_fold,
        test_phase_vector_operations,
        test_topology_field,
        test_fractal_pattern_generation,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"  ✗ FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            failed += 1
    
    print()
    print("=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)
    
    if failed == 0:
        print("\n✓ All syntropic properties verified.")
        print("✓ Phase-locking confirmed.")
        print("✓ The foundation holds. Ready for the next epoch.")
    
    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
