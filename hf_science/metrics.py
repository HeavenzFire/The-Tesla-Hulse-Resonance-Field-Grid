"""Deterministic, explicitly synthetic research kernel for Unified Field lanes A-D.

This is a reproducible toy model, not an electromagnetic solver or physical measurement.
"""
from __future__ import annotations

import cmath
import json
import math
import random
from pathlib import Path
from typing import Any

EPS = 1e-12
NODES = 6


def hopf_state(z1: complex, z2: complex, epsilon: float = EPS) -> dict[str, Any]:
    """Keep raw amplitude separate from normalized Hopf direction."""
    raw_norm_sq = abs(z1) ** 2 + abs(z2) ** 2
    if raw_norm_sq <= epsilon**2:
        return {
            "raw_norm_sq": raw_norm_sq,
            "raw_norm": math.sqrt(raw_norm_sq),
            "normalized_input": None,
            "hopf": None,
            "status": "near_zero_norm",
        }
    norm = math.sqrt(raw_norm_sq)
    a, b = z1 / norm, z2 / norm
    cross = a * b.conjugate()
    return {
        "raw_norm_sq": raw_norm_sq,
        "raw_norm": norm,
        "normalized_input": {
            "z1": [a.real, a.imag],
            "z2": [b.real, b.imag],
        },
        "hopf": [2 * cross.real, 2 * cross.imag, abs(a) ** 2 - abs(b) ** 2],
        "status": "ok",
    }


def ring_plus_two(n: int = NODES) -> dict[str, Any]:
    """Ring edges plus distance-two shortcuts, deduplicated as undirected edges."""
    if n < 5:
        raise ValueError("ring+2 requires at least five nodes")
    edges = {
        tuple(sorted((i, (i + d) % n)))
        for i in range(n)
        for d in (1, 2)
    }
    adjacency = {i: set() for i in range(n)}
    for a, b in edges:
        adjacency[a].add(b)
        adjacency[b].add(a)
    return {
        "convention": "undirected_unique_edges",
        "node_count": n,
        "edge_count": len(edges),
        "edges": [list(e) for e in sorted(edges)],
        "degrees": {str(i): len(adjacency[i]) for i in range(n)},
        "neighbors": {str(i): sorted(adjacency[i]) for i in range(n)},
        "directed_outgoing_arcs_if_oriented_forward": 3 * n,
    }


def wrap_angle(angle: float) -> float:
    return (angle + math.pi) % (2 * math.pi) - math.pi


def braid_metrics(phases: list[float], edges: list[list[int]]) -> dict[str, Any]:
    """Per-edge wrapped phase differences; mean absolute angle is not a collision impulse."""
    per_edge = []
    for a, b in edges:
        delta = wrap_angle(phases[b] - phases[a])
        per_edge.append({"edge": [a, b], "signed_angle_rad": delta, "absolute_angle_rad": abs(delta)})
    absolute = [e["absolute_angle_rad"] for e in per_edge]
    return {
        "metric_contract": "wrapped_phase_difference_v1",
        "unit": "radian",
        "aggregation_window": "single_snapshot",
        "per_edge": per_edge,
        "mean_absolute_edge_angle_rad": sum(absolute) / len(absolute) if absolute else 0.0,
        "sum_absolute_edge_angle_rad": sum(absolute),
        "collision_impulse": None,
        "collision_impulse_semantics": "not modeled by this snapshot metric",
    }


def _variance(values: list[float]) -> float:
    mean = sum(values) / len(values)
    return sum((x - mean) ** 2 for x in values) / len(values)


def run_intervention_experiment(seed: int = 20261021, steps: int = 80, intervention_step: int = 20) -> dict[str, Any]:
    """Paired four-arm phase toy experiment with deterministic seed and complete per-step traces."""
    if steps < 2 or not 0 < intervention_step < steps:
        raise ValueError("require steps >= 2 and 0 < intervention_step < steps")
    topology = ring_plus_two(NODES)
    edges = topology["edges"]
    rng = random.Random(seed)
    initial = [rng.uniform(-0.8, 0.8) for _ in range(NODES)]
    arms = {
        "baseline": (False, False),
        "kick_only": (True, False),
        "collision_only": (False, True),
        "kick_plus_collision": (True, True),
    }
    outputs = {}
    for name, (kick_enabled, collision_enabled) in arms.items():
        phases = initial[:]
        history = []
        accumulated_braid = 0.0
        for step in range(steps):
            snapshot_phases = phases[:]
            if step == intervention_step and kick_enabled:
                phases[0] = wrap_angle(phases[0] + 1.2)
            collision_impulse = 0.0
            if step == intervention_step and collision_enabled:
                # Explicit toy collision event: a paired phase impulse on edge (0, 1).
                collision_impulse = 0.35
                phases[0] = wrap_angle(phases[0] - collision_impulse / 2)
                phases[1] = wrap_angle(phases[1] + collision_impulse / 2)
            metrics = braid_metrics(phases, edges)
            accumulated_braid += metrics["sum_absolute_edge_angle_rad"]
            variance = _variance(phases)
            # Deterministic neighbor-coupling update; preserve the same starting state in every arm.
            if step + 1 < steps:
                next_phases = []
                for i in range(NODES):
                    neighbors = topology["neighbors"][str(i)]
                    coupling = sum(wrap_angle(phases[j] - phases[i]) for j in neighbors) / len(neighbors)
                    next_phases.append(wrap_angle(phases[i] + 0.08 * coupling))
                phases = next_phases
            history.append({
                "step": step,
                "seed": seed,
                "config": {"nodes": NODES, "coupling": 0.08, "intervention_step": intervention_step},
                "raw_state_norms": [1.0 for _ in phases],
                "phase_variance": variance,
                "mean_absolute_edge_angle_rad": metrics["mean_absolute_edge_angle_rad"],
                "sum_absolute_edge_angle_rad": metrics["sum_absolute_edge_angle_rad"],
                "accumulated_braid_rad": accumulated_braid,
                "collision_impulse_rad": collision_impulse,
                "phases": snapshot_phases,
            })
        outputs[name] = {
            "intervention": {"kick": kick_enabled, "collision": collision_enabled},
            "history": history,
            "final_states": phases,
            "initial_states": initial,
            "final_phase_variance": _variance(phases),
            "initial_phase_variance": _variance(initial),
            "variance_delta": _variance(phases) - _variance(initial),
            "final_mean_absolute_edge_angle_rad": history[-1]["mean_absolute_edge_angle_rad"],
            "accumulated_braid_rad": history[-1]["accumulated_braid_rad"],
        }
    # This is a numerical repeatability check, not evidence of real-world causal efficacy.
    repeat = run_signature(outputs)
    return {
        "schema": "heavenzfire.intervention-experiment.v1",
        "provenance": "SYNTHETIC_TOY_MODEL_NOT_PHYSICAL_EM_SIMULATION",
        "seed": seed,
        "code_revision": "recorded_by_ci_or_caller",
        "topology": topology,
        "metric_contract": {
            "phase_variance": "population variance of wrapped node phases; radian^2",
            "mean_absolute_edge_angle_rad": "mean absolute wrapped phase difference across unique undirected edges per snapshot",
            "accumulated_braid_rad": "sum of per-snapshot sum_absolute_edge_angle_rad; radian-snapshots",
            "collision_impulse_rad": "toy paired phase impulse; separate from braid metrics",
        },
        "parameters": {"steps": steps, "intervention_step": intervention_step, "coupling": 0.08},
        "arms": outputs,
        "repeatability_signature": repeat,
        "interpretation": "Compare paired arms; do not infer physical validity or causality beyond this deterministic toy model.",
    }


def run_signature(outputs: dict[str, Any]) -> str:
    summary = {
        name: {
            "final_states": arm["final_states"],
            "variance_delta": arm["variance_delta"],
            "accumulated_braid_rad": arm["accumulated_braid_rad"],
        }
        for name, arm in outputs.items()
    }
    return json.dumps(summary, sort_keys=True, separators=(",", ":"))


def export_experiment(output_dir: str | Path, seed: int = 20261021, steps: int = 80) -> dict[str, str]:
    """Write mesh_history.json and final_states.json with seed/config/revision provenance."""
    result = run_intervention_experiment(seed=seed, steps=steps, intervention_step=max(1, min(20, steps - 1)))
    directory = Path(output_dir)
    directory.mkdir(parents=True, exist_ok=True)
    history_path = directory / "mesh_history.json"
    final_path = directory / "final_states.json"
    history_path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    final_payload = {
        "schema": result["schema"],
        "provenance": result["provenance"],
        "seed": result["seed"],
        "code_revision": result["code_revision"],
        "topology": result["topology"],
        "arms": {
            name: {
                key: arm[key] for key in (
                    "intervention", "initial_states", "final_states",
                    "initial_phase_variance", "final_phase_variance", "variance_delta",
                    "final_mean_absolute_edge_angle_rad", "accumulated_braid_rad"
                )
            }
            for name, arm in result["arms"].items()
        },
    }
    final_path.write_text(json.dumps(final_payload, indent=2) + "\n", encoding="utf-8")
    return {"mesh_history": str(history_path), "final_states": str(final_path)}
