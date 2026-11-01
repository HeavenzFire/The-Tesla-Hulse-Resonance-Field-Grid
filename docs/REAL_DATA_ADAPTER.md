# Real-data adapter: six-node phase CSV

The adapter in `hf_science.adapters` ingests externally supplied phase snapshots.
It does not generate substitute observations and does not claim that an input
came from a calibrated or authenticated instrument.

## Input contract

UTF-8 CSV with these required columns:

| Column | Contract |
|---|---|
| `snapshot_id` | Non-empty identifier shared by the six rows in one snapshot |
| `timestamp` | Non-empty timestamp string; all six nodes in a snapshot must match |
| `node_id` | Integer 0 through 5, exactly once per snapshot |
| `phase_rad` | Finite numeric phase in radians |

Every snapshot must contain exactly one row for each of the six nodes. Missing,
duplicate, non-finite, or inconsistent rows fail closed.

## Run

From the repository root:

```powershell
python -m hf_science.adapters path\to\measurements.csv artifacts\measured-phase-report.json
```

The JSON report includes a SHA-256 digest of the exact source bytes, per-snapshot
phase vectors, the ring+2 braid metrics, and explicit provenance/limitations.
The report labels the data as externally supplied and format-validated only;
sensor authenticity, calibration, clock synchronization, uncertainty, and
acquisition-chain integrity remain unverified until separately evidenced.

## Acceptance tests

```powershell
python -m unittest tests.test_adapters -v
python -m unittest discover -s tests -v
```

A passing test establishes adapter behavior against test fixtures, not the
validity of any real-world measurement. A real integration run requires the
actual source CSV and instrument metadata; neither is fabricated or bundled.
