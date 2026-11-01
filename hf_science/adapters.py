"""Strict CSV adapter for externally supplied phase measurements.

Input data are never synthesized. Successful parsing establishes format and
numeric validity only; it does not authenticate a sensor or validate calibration.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
from typing import Any

from hf_science.metrics import braid_metrics, ring_plus_two

REQUIRED_COLUMNS = {"snapshot_id", "timestamp", "node_id", "phase_rad"}
EXPECTED_NODES = set(range(6))


def load_phase_csv(path: str | Path) -> tuple[list[dict[str, Any]], str]:
    source = Path(path)
    raw = source.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError("input must be UTF-8 CSV") from exc

    rows: list[dict[str, Any]] = []
    reader = csv.DictReader(text.splitlines())
    if reader.fieldnames is None or not REQUIRED_COLUMNS.issubset(set(reader.fieldnames)):
        missing = sorted(REQUIRED_COLUMNS - set(reader.fieldnames or []))
        raise ValueError(f"missing required CSV columns: {missing}")

    for line_number, row in enumerate(reader, start=2):
        try:
            snapshot_id = (row["snapshot_id"] or "").strip()
            timestamp = (row["timestamp"] or "").strip()
            node_id = int(row["node_id"])
            phase = float(row["phase_rad"])
        except (TypeError, ValueError) as exc:
            raise ValueError(f"invalid field at CSV line {line_number}") from exc
        if not snapshot_id or not timestamp:
            raise ValueError(f"empty snapshot_id or timestamp at CSV line {line_number}")
        if node_id not in EXPECTED_NODES:
            raise ValueError(f"node_id must be one of 0..5 at CSV line {line_number}")
        if not math.isfinite(phase):
            raise ValueError(f"phase_rad must be finite at CSV line {line_number}")
        rows.append({
            "snapshot_id": snapshot_id,
            "timestamp": timestamp,
            "node_id": node_id,
            "phase_rad": phase,
        })
    if not rows:
        raise ValueError("CSV contains no measurement rows")
    return rows, digest


def analyze_phase_csv(input_path: str | Path, output_path: str | Path) -> dict[str, Any]:
    rows, source_sha256 = load_phase_csv(input_path)
    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        grouped.setdefault(row["snapshot_id"], []).append(row)

    topology = ring_plus_two(6)
    snapshots: list[dict[str, Any]] = []
    for snapshot_id in sorted(grouped):
        group = grouped[snapshot_id]
        node_ids = [row["node_id"] for row in group]
        if len(node_ids) != 6 or set(node_ids) != EXPECTED_NODES or len(set(node_ids)) != 6:
            raise ValueError(f"snapshot {snapshot_id!r} must contain exactly one row for each node 0..5")
        timestamps = {row["timestamp"] for row in group}
        if len(timestamps) != 1:
            raise ValueError(f"snapshot {snapshot_id!r} contains inconsistent timestamps")
        phases = [0.0] * 6
        for row in group:
            phases[row["node_id"]] = row["phase_rad"]
        snapshots.append({
            "snapshot_id": snapshot_id,
            "timestamp": next(iter(timestamps)),
            "phase_rad_by_node": phases,
            "metrics": braid_metrics(phases, topology["edges"]),
        })

    result = {
        "schema": "heavenzfire.measured_phase_analysis.v1",
        "provenance": {
            "classification": "EXTERNALLY_SUPPLIED_MEASUREMENT_INPUT",
            "source_status": "FORMAT_VALIDATED_SENSOR_AUTHENTICITY_NOT_VERIFIED",
            "source_filename": Path(input_path).name,
            "source_sha256": source_sha256,
            "phase_unit": "radian",
            "topology": "six_node_ring_plus_two_undirected",
            "synthetic_data_generated": False,
        },
        "snapshot_count": len(snapshots),
        "snapshots": snapshots,
        "limitations": [
            "CSV parsing and numeric validation do not authenticate the instrument or operator.",
            "Sensor calibration, clock synchronization, uncertainty, and acquisition chain require independent evidence.",
            "Phase metrics are descriptive and do not establish a physical field mechanism or causal effect.",
        ],
    }
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(result, indent=2, sort_keys=True, allow_nan=False) + "\n", encoding="utf-8")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_csv", help="CSV with snapshot_id,timestamp,node_id,phase_rad")
    parser.add_argument("output_json", help="destination JSON report")
    args = parser.parse_args()
    report = analyze_phase_csv(args.input_csv, args.output_json)
    print(json.dumps({
        "status": "PASS_FORMAT_AND_METRIC_VALIDATION",
        "snapshot_count": report["snapshot_count"],
        "source_sha256": report["provenance"]["source_sha256"],
        "output_json": str(args.output_json),
        "sensor_authenticity": "NOT_VERIFIED",
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
