# Base Mainnet Integration Guide

## Overview

This module binds the **Nonlinear Balanced Ternary Swarm** to **Base Mainnet (Chain ID 8453)**, creating a truth-preserving blockchain overlay where only coherent swarm states can commit transactions.

---

## Architecture

### 1. Core Components

| Component | File | Purpose |
|-----------|------|---------|
| **Anchor Layer** | `src/blockchain/anchor.py` | Python interface for resonance hashing, coherence gating, harmonic timing |
| **Smart Contract** | `contracts/SwarmValidator.sol` | Solidity contract enforcing truth-preserving logic on-chain |
| **Demo Script** | `demo_blockchain_anchor.py` | Working demonstration of all features |

### 2. Key Mechanisms

#### Resonance Hash Generation
- Converts balanced ternary register `{-1, 0, +1}` into Keccak-256 hash
- Encoding: `-1 → 0xFF`, `0 → 0x00`, `+1 → 0x01`
- Produces unique phase-aligned cryptographic signatures

#### Coherence-Gated Transactions
- **Only η = 1.0** (perfect coherence) allows transaction creation
- Incoherent states are **rejected at source** before signing
- Enforces syntropic/truth-preserving logic

#### 3-6-9 Harmonic Timing
- Aligns block commits to Tesla frequency cycles
- Valid phases: blocks where `block_number % 9 ∈ {3, 6, 0}`
- Phase 0 is interpreted as Phase 9

---

## Quick Start

### Run the Demo
```bash
cd /workspace/Living-Memory-Node
python3 demo_blockchain_anchor.py
```

**Expected Output:**
- Identity binding (mock address generated)
- Transaction rejection for incoherent state (η < 1.0) ✓
- Transaction acceptance for coherent state (η = 1.0) ✓
- Harmonic block timing verification (phases 3, 6, 9) ✓
- Resonance hash generation from trit state ✓
- Solidity contract code display ✓

---

## Deployment to Base Mainnet

### Step 1: Deploy Smart Contract

**Option A: Remix IDE (Recommended for testing)**
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Paste `contracts/SwarmValidator.sol`
3. Compile with Solidity 0.8.19+
4. Deploy to **Base Sepolia Testnet** first
5. Verify contract on Basescan

**Option B: Hardhat/Foundry (Production)**
```bash
# Using Foundry
forge create SwarmValidator \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args
```

**Contract Address:** Record deployed address for anchor configuration

### Step 2: Configure Anchor

```python
from src.blockchain.anchor import TernaryBlockchainAnchor

anchor = TernaryBlockchainAnchor(chain_id=8453)
anchor.set_identity("YOUR_PRIVATE_KEY")
anchor.contract_address = "0xDeployedContractAddress..."
```

### Step 3: Integrate with Swarm

```python
# After swarm achieves coherence
swarm_state = {
    'register': [1, 1, 1, -1, 0, ...],  # From digit engine
    'coherence': 1.0  # Must be exactly 1.0
}

tx = anchor.create_coherent_transaction(swarm_state)
if tx:
    # Broadcast via Web3
    web3.eth.send_raw_transaction(tx['signed'])
```

---

## Smart Contract Interface

### Functions

#### `submitCoherentState(bytes32 resonanceHash, uint256 coherenceProof)`
Submits a single coherent state to the blockchain.
- **reverts** if `coherenceProof != 1e18`
- **emits** `StateCommitted` event on success

#### `submitHarmonicBatch(bytes32[] hashes, uint256 coherenceProof)`
Batch submission aligned to harmonic blocks (3, 6, 9).
- **reverts** if not harmonic block phase
- **emits** `HarmonicSync` event

#### `getLastCoherenceScore() → uint256`
Returns last recorded coherence score (view function).

#### `getNodeSubmissionCount(address node) → uint256`
Returns total submissions from a swarm node.

### Events

- `StateCommitted(address swarmNode, bytes32 resonanceHash, uint256 coherence, uint256 blockNumber, uint256 timestamp)`
- `Rejected(address swarmNode, uint256 coherence, string reason)`
- `HarmonicSync(uint256 blockNumber, uint256 phase)`

---

## Truth-Preserving Logic

| Swarm State | Coherence (η) | Transaction Result |
|-------------|---------------|-------------------|
| Chaotic | 0.0 - 0.9 | ❌ REJECTED |
| Partial | 0.9 - 0.999 | ❌ REJECTED |
| **Perfect** | **1.000** | ✅ **ACCEPTED** |

This ensures **only syntropic states** (self-organized, coherent) can write to the blockchain—creating a **truth-preserving ledger**.

---

## Next Steps

1. **Testnet Deployment**: Deploy to Base Sepolia, run integration tests
2. **Web3 Integration**: Connect Python anchor to actual blockchain via `web3.py`
3. **Live Swarm Binding**: Hook digit engine output directly to anchor
4. **Harmonic Monitor**: Build real-time block watcher for phase 3/6/9 alerts
5. **Scale**: Deploy multiple validator contracts for different swarm clusters

---

## Network Details

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Base Mainnet | 8453 | `https://mainnet.base.org` | basescan.org |
| Base Sepolia | 84532 | `https://sepolia.base.org` | sepolia.basescan.org |

---

## Philosophy

> *"By encoding the operators and swarm logic, you'll have a living nonlinear balanced ternary system that evolves in real time. Think of it as a **harmonic computer**, where truth emerges from resonance rather than brute force."*

This integration makes that philosophy **executable on-chain**.
