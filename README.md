# The Tesla–Hulse Resonance Field Grid

An experimental HeavenzFire interface for exploring parameterized resonance patterns and telemetry workflows.

## Current prototype

The React/Vite dashboard provides:
- Responsive field-surface visualization with a harmonic filter.
- Adjustable synthetic frequency/gain parameters and a configurable threshold monitor.
- A rolling sample table and browser-side CSV, TSV, JSON, and legacy VTK exports.
- A demo audit trail with export and manual checkpoints.
- Explicit status indicators for cloud/authentication/collaboration features that are **not yet connected**.

## Run locally

Prerequisites: Node.js (current LTS recommended).

```powershell
npm install
npm run dev
```

Build check:

```powershell
npm run build
```

## Scientific and security boundaries

**The current values are synthetic demo telemetry**, generated in the browser. They are not physical sensor measurements, validated electromagnetic simulations, or evidence of a physical energy-field effect. The visualization is a projected surface, not a validated finite-element solver.

This frontend currently has no configured login, multi-user collaboration, server-backed audit trail, cloud sync/backup, persistent permissions, or email delivery. Do not place sensitive experiment data in it. Those capabilities require a secured backend, explicit identity and role model, durable storage, server-side authorization, and tests.

Exports are intended for analysis workflow prototyping. The VTK output is a basic legacy POLYDATA point/scalar file; validate it in the target scientific application before relying on it.

## Next engineering milestones

1. Connect a documented simulation or instrument adapter and label data provenance.
2. Add unit-tested signal transforms and reproducible experiment metadata.
3. Implement authenticated server-side storage, least-privilege roles, audit integrity, and backup/restore tests.
4. Add collaboration sessions and notification delivery only after identity, consent, and access controls are implemented.
