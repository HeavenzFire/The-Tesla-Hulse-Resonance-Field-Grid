# Balanced-ternary and 3-6-9 timing audit
Date: 2026-11-13
Scope: static inspection of Living-Memory-Node/src/core/ternary.py, src/core/digit_engine.py, src/resonance/synchronizer.py, and the React telemetry generator in App.tsx. Selected snippets were independently reproduced in an isolated Python process to check the identified edge cases. No repository code was modified.

## Executive summary
The balanced-ternary integer representation is mathematically correct in the tested range. Several surrounding operators and the timing controller, however, contain concrete implementation defects. The React dashboard clearly labels its signal data as synthetic demo telemetry; it must not be interpreted as measured resonance or physical field data.

## Confirmed positive result
- Reproduced the balanced-ternary conversion algorithm and checked integer -> trits -> integer round trips for every integer from -10,000 through 10,000: 20,001 values, zero failures.
- The trit alphabet {-1,0,+1} and positional weights 3^i form a valid balanced-ternary representation.

## Confirmed implementation defects

### 1. Coherence window has an off-by-one / precedence error
In `op_coherence`, the loop is:
`range(-window//2, window//2 + 1)`.
Python evaluates `-window//2` as floor division of the negative number. For the default `window=3`, the offsets are -2,-1,0,1: four cells, not the intended three. This makes the local neighborhood asymmetric and changes the majority result near boundaries and across patterns. Define the window semantics explicitly and compute offsets from a nonnegative half-width.

### 2. Resonance frequency parameter is unused
`op_resonate(register, frequency=3)` never reads `frequency`. Calls with frequency 1 and frequency 9 produce identical output for the same register. The implementation is a fixed index mask at positions 3, 6, and 9 in each nine-trit block, not frequency-dependent modulation.

### 3. Swarm controller makes resonance decisions using the previous phase
`HarmonicSwarmController.run_harmonic_cycle` reads `is_resonance` and `mod_factor` before calling `tick()`. It then advances the phase and reports the new phase in the metrics. A simple phase trace shows the decision made for old phase 2 is reported after advancing to phase 3 as a non-resonance step; the next step applies the phase-3 resonance decision but reports phase 4. The event and metrics are therefore one phase out of alignment. Capture the phase after advancing, then derive both the flag and multiplier from that same phase.

### 4. Configured timing interval is not enforced
`base_interval` is stored and `sync_to_external_clock` updates it, but `tick()` does not wait or schedule against that interval. The code advances a logical phase counter; it does not synchronize wall-clock updates to an external frequency. The docstring's external-clock synchronization claim is not implemented.
- `sync_to_external_clock(0)` divides by zero.
- Negative target frequencies produce negative intervals.
- The method should validate finite positive frequencies and the controller should use a monotonic clock/deadline scheduler if real timing is intended.

### 5. "Rhythm coherence" is a heuristic, not a normalized physical coherence measurement
The score uses wall-clock intervals between recorded resonance events and maps their variance to `1/(1+10*variance)`. This is unit-dependent (seconds versus milliseconds change the result), has no declared expected interval, and returns 0.5 when only one event exists. It is a timing-jitter heuristic, not quantum coherence or evidence of a physical 3-6-9 resonance.

### 6. Modulation factors are arbitrary repetition counts
The phase multipliers 1.5, 2, and 3 are hardcoded. `int(1.5)` becomes one, so phase 3 does not repeat the operation at all; phase 6 repeats twice and phase 9 three times. This is a manually chosen schedule, not a derived amplification law.

### 7. Several operator names overstate their mathematical meaning
- `op_reversal` is sign inversion of nonzero trits; it does not reverse entropy. Shannon entropy is unchanged by swapping the probabilities of +1 and -1.
- `homeostatic_index` is simply the fraction of zero trits. It is a valid descriptive statistic but not a general coherence measure.
- `op_coherence` is a deterministic local-majority filter with ties mapped to zero. It may smooth patterns, but it does not establish thermodynamic entropy reversal or physical coherence.
- `harmonic_369` is signed decimal digital-root mapping, not a measured frequency resonance.

### 8. UI telemetry is synthetic
`App.tsx` computes its "resonance" and "flux" indices from sine/cosine functions of elapsed time and UI parameters. The export metadata explicitly says `SIMULATED_DEMO_DATA` and the UI says no sensor is connected. This is appropriate demo behavior, but these plots are not measurements, electromagnetic field simulations, or evidence of energy harvesting.

## Independent checks
- Balanced-ternary round-trip reproduction: 20,001 integers, zero failures.
- Coherence-window offset reproduction: `window=3` yields four offsets (-2,-1,0,1), not three.
- Resonance-frequency reproduction: frequencies 1 and 9 return identical output for the same input.
- Timing-phase reproduction: resonance flag is calculated before the tick but displayed with the post-tick phase, confirming a one-step mismatch.

## Recommended repair sequence
1. Add exhaustive conversion and operator property tests.
2. Fix the coherence window semantics and test edge handling (circular versus clipped neighborhoods).
3. Define whether `frequency` is an integer cycle length, a spatial harmonic, or a rate; implement it or remove the parameter.
4. Advance the timing state before computing phase-specific decisions; use the same phase snapshot for decision, operation, and telemetry.
5. Either implement actual monotonic-clock scheduling using `base_interval`, or rename the component as a logical phase scheduler.
6. Rename "rhythm coherence" to "timing regularity" unless a physically meaningful, unit-aware statistic is defined.
7. Compare 3-6-9 schedules with equal-compute controls and randomized schedules using predeclared metrics. Do not infer physical resonance from a hardcoded schedule.

## Limitations
- The conversion, window-offset, frequency-parameter, and phase-order checks were independently reproduced from the inspected source logic; the repository's full swarm runtime was not executed.
- No physical sensor data or external-clock measurements were available.
- No claim is made about or against any physical resonance phenomenon.
