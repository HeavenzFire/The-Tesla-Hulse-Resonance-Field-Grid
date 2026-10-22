# Unified Field Lanes A-D — reproducible research kernel

This branch adds a deterministic, standard-library-only Python research kernel for the four open microtasks. It is deliberately separate from the React telemetry dashboard and labels all experiment output as **synthetic toy-model data**, not physical electromagnetic measurements or a validated EM solver.

## Run locally

From the repository root with Python 3.12+:

```powershell
python -m unittest discover -s tests -v
python -c "from hf_science.metrics import export_experiment; print(export_experiment('artifacts'))"
```

The export command writes `artifacts/mesh_history.json` and `artifacts/final_states.json`. Both include seed/configuration, topology, metric definitions, and explicit synthetic-data provenance. The CI workflow uploads them as an artifact.

## Lane contracts

- **A — Hopf amplitude:** `raw_norm_sq`, `raw_norm`, normalized input and Hopf direction are separate. Zero/near-zero input returns a null projection instead of dividing by a tiny norm. The test fixture is illustrative; it does not claim to reconstruct the original SB-0 probe because its raw artifacts are not in this repository.
- **B — Braid metrics:** per-edge signed wrapped angle, per-edge absolute angle, snapshot mean absolute angle, snapshot sum absolute angle, and accumulated sum across snapshots are distinct fields with radian units and explicit window semantics. Collision impulse is a separate event field.
- **C — Ring+2 topology:** six-node ring plus distance-two shortcuts are represented as unique undirected edges (12 edges, degree 4). Forward-oriented directed arcs are reported separately (18 arcs for six nodes).
- **D — Intervention:** baseline, kick-only, collision-only, and kick-plus-collision arms share one seeded initial state. Per-step histories and final states are exported with a repeatability signature. The experiment demonstrates deterministic execution only; it does not establish physical validity or causal efficacy.

## Acceptance boundary

Passing unit tests verifies these code contracts and deterministic toy experiment only. The original probe files and validated physical simulation are not bundled, so live probe reproduction and electromagnetic claims remain **UNKNOWN / NOT VERIFIED**. The experiment's collision impulse is a declared toy phase perturbation, not a physical collision model.
