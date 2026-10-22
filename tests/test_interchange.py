import hashlib
import json
import re
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
INTERCHANGE = ROOT / "heavenzfire" / "interchange_example_v0.1.0.json"
SCHEMA = ROOT / "heavenzfire" / "interchange_schema_v0.1.0.json"
REGISTRY = ROOT / "heavenzfire" / "capability_registry_chatgpt_v0.1.0.json"
PLAN = ROOT / "heavenzfire" / "adapter_plan_v0.1.0.md"


class InterchangeTests(unittest.TestCase):
    def test_schema_exists(self):
        self.assertTrue(SCHEMA.is_file())
        Draft202012Validator.check_schema(json.loads(SCHEMA.read_text(encoding="utf-8")))

    def test_example_validates(self):
        schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
        example = json.loads(INTERCHANGE.read_text(encoding="utf-8"))
        errors = sorted(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(example), key=lambda e: list(map(str, e.absolute_path)))
        self.assertEqual([], [f"{list(e.absolute_path)}: {e.message}" for e in errors])

    def test_capability_registry(self):
        registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
        caps = registry["capabilities"]
        self.assertTrue(caps["portable_file_interchange"])
        self.assertTrue(caps["write_github_files"])
        self.assertFalse(caps["direct_private_meta_share_fetch"])
        self.assertFalse(caps["direct_api_access_to_other_ai_platforms"])
        self.assertFalse(caps["python_runtime_direct_internet"])

    def test_no_invented_state(self):
        example = json.loads(INTERCHANGE.read_text(encoding="utf-8"))
        self.assertIsNone(example["conversation_reference"]["share_url"])
        self.assertFalse(example["conversation_reference"]["retrievable"])
        self.assertIn("not attached", example["conversation_reference"]["last_verified_message"])
        self.assertTrue(any("SHA-256" in x for x in example["capability_registry"][0]["limitations"]))
        self.assertEqual("partial", next(t["status"] for t in example["task_status"] if t["task_id"] == "T-004"))

    def test_hash_artifacts(self):
        # Verify the manifest against the exact bytes committed in this repository.
        # The source Meta digest is not asserted because those original files were not attached.
        example = json.loads(INTERCHANGE.read_text(encoding="utf-8"))
        expected_paths = {
            "A-001": SCHEMA,
            "A-002": PLAN,
            "A-003": REGISTRY,
        }
        manifest = {item["artifact_id"]: item["hash"] for item in example["artifacts"]}
        for artifact_id, path in expected_paths.items():
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            self.assertEqual(manifest[artifact_id], digest, path.as_posix())
            self.assertRegex(digest, re.compile(r"^[0-9a-f]{64}$"))
            print(f"SHA256 {path.relative_to(ROOT).as_posix()}={digest}")
        for path in (INTERCHANGE,):
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            self.assertRegex(digest, re.compile(r"^[0-9a-f]{64}$"))
            print(f"SHA256 {path.relative_to(ROOT).as_posix()}={digest} (manifest self-hash intentionally omitted)")


if __name__ == "__main__":
    unittest.main(verbosity=2)
