import copy
import unittest

from hf_federation.mesh import (
    AppendOnlyEventLog,
    MeshRouter,
    SandboxNode,
    TaskEnvelope,
    sign_envelope,
    verify_envelope,
)


KEY = b"test-only-development-key-not-for-production"


def envelope(task_id="task-1", caps=("python-tests",), now=100):
    return sign_envelope(TaskEnvelope(
        task_id=task_id,
        objective="run bounded test suite",
        required_capabilities=tuple(caps),
        constraints={"network": "disabled", "max_runtime_seconds": 30},
        issued_at=now,
        deadline=now + 60,
        nonce="nonce-" + task_id,
    ), KEY)


class EnvelopeTests(unittest.TestCase):
    def test_signature_and_time_window(self):
        signed = envelope()
        self.assertTrue(verify_envelope(signed, KEY, now=101))
        self.assertFalse(verify_envelope(signed, KEY, now=161))
        self.assertFalse(verify_envelope(signed, KEY, now=99))

    def test_tampered_payload_rejected(self):
        signed = envelope()
        signed["payload"]["objective"] = "different objective"
        self.assertFalse(verify_envelope(signed, KEY, now=101))


class RoutingTests(unittest.TestCase):
    def test_routes_to_least_loaded_capable_alive_node(self):
        router = MeshRouter()
        router.register(SandboxNode("node-b", {"python-tests"}, active_task_ids={"existing"}))
        router.register(SandboxNode("node-a", {"python-tests"}))
        router.register(SandboxNode("node-dark", {"python-tests"}, state="DARK", dark_reason="offline"))
        result = router.route(envelope(), KEY, now=101)
        self.assertEqual(result, {"task_id": "task-1", "node_id": "node-a", "status": "ASSIGNED"})
        self.assertEqual(router.route(envelope(), KEY, now=101)["status"], "ALREADY_ASSIGNED")

    def test_no_capability_match_fails_closed(self):
        router = MeshRouter()
        router.register(SandboxNode("node-a", {"python-tests"}))
        with self.assertRaises(RuntimeError):
            router.route(envelope(caps=("network-admin",)), KEY, now=101)

    def test_tampered_envelope_cannot_route(self):
        router = MeshRouter()
        router.register(SandboxNode("node-a", {"python-tests"}))
        signed = envelope()
        signed["payload"]["constraints"]["network"] = "enabled"
        with self.assertRaises(ValueError):
            router.route(signed, KEY, now=101)


class MeshSyncTests(unittest.TestCase):
    def test_hash_chain_verifies_and_sync_is_idempotent(self):
        source = AppendOnlyEventLog()
        source.append("e1", "TASK_ASSIGNED", {"task_id": "t1"}, 101)
        source.append("e2", "TASK_COMPLETED", {"task_id": "t1", "result": "PASS"}, 102)
        replica = AppendOnlyEventLog()
        result = replica.import_events(copy.deepcopy(source.events))
        self.assertEqual(result, {"imported": 2, "skipped_duplicates": 0})
        self.assertTrue(replica.verify())
        self.assertEqual(replica.head, source.head)
        self.assertEqual(replica.import_events(copy.deepcopy(source.events)), {"imported": 0, "skipped_duplicates": 2})

    def test_tampered_or_noncontiguous_event_rejected(self):
        source = AppendOnlyEventLog()
        source.append("e1", "HEALTH", {"state": "ALIVE"}, 101)
        tampered = copy.deepcopy(source.events)
        tampered[0]["data"]["state"] = "DARK"
        replica = AppendOnlyEventLog()
        with self.assertRaises(ValueError):
            replica.import_events(tampered)


if __name__ == "__main__":
    unittest.main()
