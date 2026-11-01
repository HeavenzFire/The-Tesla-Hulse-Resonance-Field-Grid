import csv
import json
import tempfile
import unittest
from pathlib import Path

from hf_science.adapters import analyze_phase_csv, load_phase_csv


class PhaseCsvAdapterTests(unittest.TestCase):
    def _write(self, root: Path, rows: list[dict[str, object]]) -> Path:
        path = root / "measurements.csv"
        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=["snapshot_id", "timestamp", "node_id", "phase_rad"])
            writer.writeheader()
            writer.writerows(rows)
        return path

    def _rows(self) -> list[dict[str, object]]:
        return [
            {"snapshot_id": "s1", "timestamp": "2026-11-01T12:00:00Z", "node_id": i, "phase_rad": i * 0.1}
            for i in range(6)
        ]

    def test_valid_input_is_hashed_and_never_relabelled_as_verified_sensor_data(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = self._write(root, self._rows())
            output = root / "out" / "report.json"
            report = analyze_phase_csv(source, output)
            saved = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(report, saved)
            self.assertEqual(report["snapshot_count"], 1)
            self.assertEqual(report["provenance"]["classification"], "EXTERNALLY_SUPPLIED_MEASUREMENT_INPUT")
            self.assertEqual(report["provenance"]["source_status"], "FORMAT_VALIDATED_SENSOR_AUTHENTICITY_NOT_VERIFIED")
            self.assertFalse(report["provenance"]["synthetic_data_generated"])
            self.assertEqual(len(report["snapshots"][0]["metrics"]["per_edge"]), 12)

    def test_rejects_missing_node(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = self._write(Path(tmp), self._rows()[:-1])
            with self.assertRaisesRegex(ValueError, "exactly one row"):
                analyze_phase_csv(source, Path(tmp) / "out.json")

    def test_rejects_duplicate_node(self):
        with tempfile.TemporaryDirectory() as tmp:
            rows = self._rows()
            rows[-1]["node_id"] = 4
            source = self._write(Path(tmp), rows)
            with self.assertRaisesRegex(ValueError, "exactly one row"):
                analyze_phase_csv(source, Path(tmp) / "out.json")

    def test_rejects_non_finite_phase(self):
        with tempfile.TemporaryDirectory() as tmp:
            rows = self._rows()
            rows[0]["phase_rad"] = "nan"
            source = self._write(Path(tmp), rows)
            with self.assertRaisesRegex(ValueError, "finite"):
                load_phase_csv(source)

    def test_rejects_mixed_timestamps_within_snapshot(self):
        with tempfile.TemporaryDirectory() as tmp:
            rows = self._rows()
            rows[0]["timestamp"] = "2026-11-01T12:00:01Z"
            source = self._write(Path(tmp), rows)
            with self.assertRaisesRegex(ValueError, "inconsistent timestamps"):
                analyze_phase_csv(source, Path(tmp) / "out.json")


if __name__ == "__main__":
    unittest.main()
