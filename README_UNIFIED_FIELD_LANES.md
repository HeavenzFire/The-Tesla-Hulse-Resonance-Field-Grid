# Unified Field Lanes A–D — reproducible kernel and local mesh coordinator

This branch adds deterministic scientific metrics plus a local-first task-routing and event-synchronization core. Scientific experiment output is explicitly labeled **synthetic toy-model data**, not physical electromagnetic measurements or a validated EM solver.

## Run locally (PowerShell)

```powershell
python -m unittest discover -s tests -v
python -c "from hf_science.metrics import export_experiment; print(export_experiment('artifacts'))"
```

The export command writes `artifacts/mesh_history.json` and `artifacts/final_states.json`. CI uploads them as an artifact.

## Lanes A–D

- **A — Hopf amplitude:** raw norm and normalized Hopf direction are separate; near-zero input returns a null projection. The test reconstructs a mathematical fixture from rounded reported coordinates and raw norm; it does not reproduce the original probe without its raw artifacts.
- **B — Braid metrics:** per-edge signed wrapped angle, per-edge absolute angle, snapshot mean/sum and accumulated sum are separate fields with radian units and explicit windows. Collision impulse is a distinct event field.
- **C — Ring+2 topology:** six-node ring plus distance-two shortcuts yields 12 unique undirected edges, degree 4 per node; directed forward arcs are reported separately.
- **D — Intervention:** four seeded arms (baseline, kick, collision, kick+collision) share one initial state. Per-step histories and final states are exported with configuration and provenance. This demonstrates deterministic execution only, not physical validity or causal efficacy.

## Local micro-sandbox / mesh core

`hf_federation.mesh` provides:

- HMAC-SHA256 signed task envelopes with deadlines and tamper detection (caller supplies the secret key; do not commit production secrets).
- Capability- and capacity-aware routing across registered ALIVE nodes, with explicit DARK reasons, deterministic least-loaded selection and idempotent task assignment.
- A hash-chained append-only event log and contiguous, tamper-checked, duplicate-safe event import for mesh synchronization.

This is a **coordination primitive**, not a deployed multi-machine federation. It does not create GitHub Codespaces, execute arbitrary task payloads, establish network transport, isolate OS processes, provide key rotation, or replace production identity/authorization. Those require adapters, real isolation and operational deployment tests. The current CI validates the local core only.
