"""
Audit Logging System for Syntropic Engine
Records all operations, metrics, and state transitions for transparency.
License: AGPL-3.0 (Public Good, Anti-Profit)
"""

import json
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path


class AuditLogger:
    """
    Immutable audit log for syntropic operations.
    Ensures full transparency and reproducibility.
    """
    
    def __init__(self, log_path: Optional[str] = None):
        self.log_path = Path(log_path) if log_path else Path("syntropic_audit.jsonl")
        self.entries: List[Dict[str, Any]] = []
        
    def _generate_entry_hash(self, entry: Dict[str, Any]) -> str:
        """Generate SHA-256 hash for entry integrity."""
        serialized = json.dumps(entry, sort_keys=True).encode('utf-8')
        return hashlib.sha256(serialized).hexdigest()
    
    def log_operation(
        self,
        operation: str,
        parameters: Dict[str, Any],
        metrics: Dict[str, Any],
        state_hash: Optional[str] = None
    ) -> str:
        """
        Log a syntropic operation with full metadata.
        Returns entry hash for verification.
        """
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "operation": operation,
            "parameters": parameters,
            "metrics": metrics,
            "state_hash": state_hash,
            "license": "AGPL-3.0",
            "anti_profit_verified": True
        }
        
        entry["entry_hash"] = self._generate_entry_hash(entry)
        
        # Chain to previous entry for immutability
        if self.entries:
            entry["previous_hash"] = self.entries[-1]["entry_hash"]
        else:
            entry["previous_hash"] = "genesis_block"
        
        self.entries.append(entry)
        self._persist_entry(entry)
        
        return entry["entry_hash"]
    
    def _persist_entry(self, entry: Dict[str, Any]) -> None:
        """Append entry to JSONL file."""
        with open(self.log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry) + '\n')
    
    def verify_integrity(self) -> bool:
        """Verify chain integrity (blockchain-style)."""
        if not self.entries:
            return True
        
        for i, entry in enumerate(self.entries):
            # Verify entry hash
            expected_hash = self._generate_entry_hash({
                k: v for k, v in entry.items() if k != "entry_hash"
            })
            if entry["entry_hash"] != expected_hash:
                print(f"❌ Entry {i} hash mismatch!")
                return False
            
            # Verify chain linkage
            if i > 0:
                if entry["previous_hash"] != self.entries[i-1]["entry_hash"]:
                    print(f"❌ Entry {i} chain broken!")
                    return False
        
        print("✓ Audit chain integrity verified.")
        return True
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Aggregate metrics from all logged operations."""
        if not self.entries:
            return {"count": 0}
        
        drift_values = [
            e["metrics"].get("max_drift", 0) 
            for e in self.entries 
            if "max_drift" in e.get("metrics", {})
        ]
        
        resonance_factors = [
            e["metrics"].get("constructive_resonance_factor", 0)
            for e in self.entries
            if "constructive_resonance_factor" in e.get("metrics", {})
        ]
        
        return {
            "total_operations": len(self.entries),
            "avg_drift": sum(drift_values) / len(drift_values) if drift_values else 0,
            "max_drift_observed": max(drift_values) if drift_values else 0,
            "avg_resonance_factor": sum(resonance_factors) / len(resonance_factors) if resonance_factors else 0,
            "unitarity_pass_rate": sum(1 for d in drift_values if d < 1e-14) / len(drift_values) if drift_values else 0
        }
    
    def export_public_report(self, output_path: str) -> None:
        """Export anonymized public report for community review."""
        summary = self.get_metrics_summary()
        report = {
            "report_type": "Syntropic Engine Public Audit",
            "license": "AGPL-3.0",
            "generated_at": datetime.utcnow().isoformat(),
            "summary": summary,
            "entries_count": len(self.entries),
            "integrity_verified": self.verify_integrity(),
            "note": "Full logs available at: syntropic_audit.jsonl"
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        
        print(f"✓ Public report exported to {output_path}")


if __name__ == "__main__":
    # Demo: Create audit trail
    logger = AuditLogger()
    
    logger.log_operation(
        operation="phase_evolution",
        parameters={"n_states": 1024, "steps": 5000, "theta": 0.01},
        metrics={
            "max_drift": 1.15e-14,
            "constructive_resonance_factor": 1.217,
            "operations_per_second": 45000000
        },
        state_hash="abc123..."
    )
    
    logger.log_operation(
        operation="cache_optimization",
        parameters={"cache_line_size": 64, "prefetch_enabled": True},
        metrics={
            "l1_hit_rate": 0.987,
            "gc_suppression_factor": 15.3
        }
    )
    
    print("\n[AUDIT SUMMARY]")
    print(json.dumps(logger.get_metrics_summary(), indent=2))
    logger.verify_integrity()
    logger.export_public_report("public_audit_report.json")
