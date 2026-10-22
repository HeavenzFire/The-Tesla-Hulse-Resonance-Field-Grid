import json
import math
import tempfile
import unittest
from pathlib import Path

from hf_science.metrics import (
    braid_metrics,
    export_experiment,
    hopf_state,
    ring_plus_two,
    run_intervention_experiment,
)


class HopfTests(unittest.TestCase):
    def test_sb0_reported_projection_and_raw_norm_are_separate(self):
        # Reconstruct a mathematical fixture from the rounded reported projection
        # (-0.136, 0.988, -0.074) and raw norm ~0.00104. This is NOT the original
        # probe state; original raw artifacts are not present in this repository.
        target = (-0.136, 0.988, -0.074)
        target_norm = math.sqrt(sum(v * v for v in target))
        x, y, z = (v / target_norm for v in target)
        raw_norm = 0.00104
        theta = math.atan2(y, x)
        p, q = (1 + z) / 2, (1 - z) / 2
        z1 = complex(raw_norm * math.sqrt(p), 0.0)
        z2 = raw_norm * math.sqrt(q) * complex(math.cos(-theta), math.sin(-theta))
        state = hopf_state(z1, z2)
        self.assertAlmostEqual(state["raw_norm"], raw_norm, places=12)
        self.assertAlmostEqual(state["raw_norm_sq"], raw_norm**2, places=15)
        for actual, expected in zip(state["hopf"], target):
            self.assertAlmostEqual(actual, expected, delta=0.002)
        self.assertAlmostEqual(math.sqrt(sum(v * v for v in state["hopf"])), 1.0, places=12)
        self.assertEqual(state["status"], "ok")

    def test_zero_and_near_zero_norm_do_not_divide(self):
        for a, b in [(0j, 0j), (1e-15 + 0j, 0j)]:
            state = hopf_state(a, b)
            self.assertIsNone(state["hopf"])
            self.assertEqual(state["status"], "near_zero_norm")

    def test_projection_matches_known_normalized_input(self):
        state = hopf_state(1 + 0j, 0 + 0j)
        self.assertEqual(state["hopf"], [0.0, 0.0, 1.0])


class TopologyTests(unittest.TestCase):
    def test_ring_plus_two_six_nodes(self):
        topology = ring_plus_two(6)
        self.assertEqual(topology["edge_count"], 12)
        self.assertEqual(len(topology["edges"]), len({tuple(e) for e in topology["edges"]}))
        self.assertEqual(set(topology["degrees"].values()), {4})
        for node in range(6):
            self.assertEqual(topology["neighbors"][str(node)], sorted(topology["neighbors"][str(node)]))
            self.assertEqual(len(topology["neighbors"][str(node)]), 4)

    def test_reject_too_small_ring(self):
        with self.assertRaises(ValueError):
            ring_plus_two(4)


class BraidTests(unittest.TestCase):
    def test_metric_names_and_units_are_explicit(self):
        result = braid_metrics([0.0, math.pi / 2, math.pi], [[0, 1], [1, 2]])
        self.assertEqual(result["metric_contract"], "wrapped_phase_difference_v1")
        self.assertEqual(result["unit"], "radian")
        self.assertAlmostEqual(result["mean_absolute_edge_angle_rad"], math.pi / 2)
        self.assertEqual(result["collision_impulse"], None)
        self.assertNotIn("braid", result)

    def test_wraparound_uses_shortest_signed_angle(self):
        result = braid_metrics([math.pi - 0.1, -math.pi + 0.1], [[0, 1]])
        self.assertAlmostEqual(result["per_edge"][0]["signed_angle_rad"], 0.2)


class InterventionTests(unittest.TestCase):
    def test_four_arms_seeded_and_repeatable(self):
        first = run_intervention_experiment(seed=123, steps=12, intervention_step=4)
        second = run_intervention_experiment(seed=123, steps=12, intervention_step=4)
        self.assertEqual(set(first["arms"]), {"baseline", "kick_only", "collision_only", "kick_plus_collision"})
        self.assertEqual(first["repeatability_signature"], second["repeatability_signature"])
        self.assertEqual(first["topology"]["edge_count"], 12)
        for arm in first["arms"].values():
            self.assertEqual(len(arm["history"]), 12)
            self.assertEqual(len(arm["final_states"]), 6)
            self.assertIn("variance_delta", arm)

    def test_exports_required_artifacts_and_provenance(self):
        with tempfile.TemporaryDirectory() as tmp:
            paths = export_experiment(tmp, seed=5, steps=8)
            self.assertTrue(Path(paths["mesh_history"]).exists())
            self.assertTrue(Path(paths["final_states"]).exists())
            payload = json.loads(Path(paths["mesh_history"]).read_text(encoding="utf-8"))
            self.assertEqual(payload["provenance"], "SYNTHETIC_TOY_MODEL_NOT_PHYSICAL_EM_SIMULATION")
            self.assertEqual(set(payload["arms"]), {"baseline", "kick_only", "collision_only", "kick_plus_collision"})


if __name__ == "__main__":
    unittest.main()
