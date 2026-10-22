"""Local-first task routing and mesh event synchronization primitives.

This module coordinates bounded task metadata only. It does not execute arbitrary
commands, create hosted sandboxes, or provide network transport.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import time
from dataclasses import asdict, dataclass, field
from typing import Any


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


@dataclass(frozen=True)
class TaskEnvelope:
    task_id: str
    objective: str
    required_capabilities: tuple[str, ...]
    constraints: dict[str, Any]
    issued_at: int
    deadline: int
    nonce: str

    def payload(self) -> dict[str, Any]:
        value = asdict(self)
        value["required_capabilities"] = list(self.required_capabilities)
        return value


def sign_envelope(envelope: TaskEnvelope, key: bytes) -> dict[str, Any]:
    if not key:
        raise ValueError("signing key must not be empty")
    payload = envelope.payload()
    signature = hmac.new(key, canonical_json(payload), hashlib.sha256).hexdigest()
    return {"payload": payload, "signature": signature, "algorithm": "HMAC-SHA256"}


def verify_envelope(signed: dict[str, Any], key: bytes, now: int | None = None) -> bool:
    if not key or signed.get("algorithm") != "HMAC-SHA256":
        return False
    payload = signed.get("payload")
    signature = signed.get("signature")
    if not isinstance(payload, dict) or not isinstance(signature, str):
        return False
    expected = hmac.new(key, canonical_json(payload), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return False
    clock = int(time.time()) if now is None else now
    try:
        if int(payload["issued_at"]) > clock or int(payload["deadline"]) < clock:
            return False
        if int(payload["deadline"]) < int(payload["issued_at"]):
            return False
        if not payload["task_id"] or not payload["objective"] or not payload["nonce"]:
            return False
    except (KeyError, TypeError, ValueError):
        return False
    return True


@dataclass
class SandboxNode:
    node_id: str
    capabilities: set[str]
    max_active_tasks: int = 1
    active_task_ids: set[str] = field(default_factory=set)
    state: str = "ALIVE"
    dark_reason: str | None = None

    def __post_init__(self) -> None:
        if not self.node_id or self.max_active_tasks < 1:
            raise ValueError("node_id and positive max_active_tasks are required")
        if self.state not in {"ALIVE", "DARK"}:
            raise ValueError("state must be ALIVE or DARK")
        if self.state == "DARK" and not self.dark_reason:
            self.dark_reason = "unspecified"


class MeshRouter:
    def __init__(self) -> None:
        self.nodes: dict[str, SandboxNode] = {}
        self.assignments: dict[str, str] = {}

    def register(self, node: SandboxNode) -> None:
        existing = self.nodes.get(node.node_id)
        if existing and existing is not node:
            raise ValueError(f"node already registered: {node.node_id}")
        self.nodes[node.node_id] = node

    def route(self, signed_envelope: dict[str, Any], key: bytes, now: int | None = None) -> dict[str, str]:
        if not verify_envelope(signed_envelope, key, now):
            raise ValueError("invalid, expired, or tampered task envelope")
        payload = signed_envelope["payload"]
        task_id = payload["task_id"]
        if task_id in self.assignments:
            return {"task_id": task_id, "node_id": self.assignments[task_id], "status": "ALREADY_ASSIGNED"}
        required = set(payload["required_capabilities"])
        candidates = [
            node for node in self.nodes.values()
            if node.state == "ALIVE"
            and len(node.active_task_ids) < node.max_active_tasks
            and required.issubset(node.capabilities)
        ]
        if not candidates:
            raise RuntimeError("no eligible ALIVE node has the required capabilities and capacity")
        node = sorted(candidates, key=lambda n: (len(n.active_task_ids), n.node_id))[0]
        node.active_task_ids.add(task_id)
        self.assignments[task_id] = node.node_id
        return {"task_id": task_id, "node_id": node.node_id, "status": "ASSIGNED"}


class AppendOnlyEventLog:
    """Hash-chained local event log; sync import is idempotent by event_id."""
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []
        self._event_ids: set[str] = set()
        self._head = "0" * 64

    @property
    def head(self) -> str:
        return self._head

    def append(self, event_id: str, event_type: str, data: dict[str, Any], timestamp: int) -> dict[str, Any]:
        if not event_id or not event_type:
            raise ValueError("event_id and event_type are required")
        if event_id in self._event_ids:
            return next(e for e in self.events if e["event_id"] == event_id)
        body = {
            "event_id": event_id,
            "event_type": event_type,
            "data": data,
            "timestamp": int(timestamp),
            "previous_hash": self._head,
        }
        digest = hashlib.sha256(canonical_json(body)).hexdigest()
        event = {**body, "event_hash": digest}
        self.events.append(event)
        self._event_ids.add(event_id)
        self._head = digest
        return event

    def import_events(self, incoming: list[dict[str, Any]]) -> dict[str, int]:
        imported = skipped = 0
        for event in incoming:
            if event["event_id"] in self._event_ids:
                skipped += 1
                continue
            # Only append a contiguous, independently verifiable event from this log's current head.
            body = {k: event[k] for k in ("event_id", "event_type", "data", "timestamp", "previous_hash")}
            expected = hashlib.sha256(canonical_json(body)).hexdigest()
            if event.get("previous_hash") != self._head or not hmac.compare_digest(event.get("event_hash", ""), expected):
                raise ValueError("event chain mismatch; refusing non-contiguous or tampered sync event")
            self.events.append(dict(event))
            self._event_ids.add(event["event_id"])
            self._head = expected
            imported += 1
        return {"imported": imported, "skipped_duplicates": skipped}

    def verify(self) -> bool:
        previous = "0" * 64
        seen = set()
        for event in self.events:
            body = {k: event[k] for k in ("event_id", "event_type", "data", "timestamp", "previous_hash")}
            expected = hashlib.sha256(canonical_json(body)).hexdigest()
            if event["event_id"] in seen or event["previous_hash"] != previous or not hmac.compare_digest(event["event_hash"], expected):
                return False
            seen.add(event["event_id"])
            previous = expected
        return previous == self._head and seen == self._event_ids
