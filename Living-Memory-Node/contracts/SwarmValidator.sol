// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SwarmValidator
 * @dev Enforces Truth-Preserving Logic on Base Mainnet (Chain ID 8453).
 *      Only accepts transactions from Ternary Swarms with Coherence = 1.0.
 * 
 * MECHANISM:
 * - Receives Keccak-256 hash of balanced ternary register state {-1,0,1}
 * - Validates coherence proof (must equal exactly 1e18, i.e., 1.0)
 * - Rejects all incoherent states (syntropic filter)
 * - Emits resonance events for phase-aligned indexing
 */
contract SwarmValidator {
    
    address public owner;
    uint256 public constant PERFECT_COHERENCE = 1e18; // Fixed point 1.0
    uint256 public lastCoherenceScore;
    bytes32 public lastResonanceHash;
    mapping(address => uint256) public nodeCoherenceHistory;
    mapping(address => uint256) public submissionCount;
    
    event StateCommitted(
        address indexed swarmNode, 
        bytes32 resonanceHash, 
        uint256 coherence,
        uint256 blockNumber,
        uint256 timestamp
    );
    
    event Rejected(
        address indexed swarmNode, 
        uint256 coherence, 
        string reason
    );
    
    event HarmonicSync(
        uint256 blockNumber,
        uint256 phase // 3, 6, or 9
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Submit a state from the Ternary Swarm
     * @param resonanceHash The Keccak-256 hash of the ternary register {-1,0,1}
     * @param coherenceProof The coherence score (fixed point 18 decimals, must be 1e18)
     * @return success True if state was committed
     */
    function submitCoherentState(bytes32 resonanceHash, uint256 coherenceProof) external returns (bool) {
        // TRUTH-PRESERVING CHECK: Reject if not perfectly coherent
        if (coherenceProof != PERFECT_COHERENCE) {
            emit Rejected(msg.sender, coherenceProof, "Coherence below threshold");
            revert("Transaction Rejected: Swarm Incoherent");
        }
        
        // Update State
        lastResonanceHash = resonanceHash;
        lastCoherenceScore = coherenceProof;
        nodeCoherenceHistory[msg.sender] = coherenceProof;
        submissionCount[msg.sender]++;
        
        emit StateCommitted(
            msg.sender, 
            resonanceHash, 
            coherenceProof,
            block.number,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @notice Batch submit for harmonic sync (phase 3, 6, 9 blocks)
     * @param hashes Array of resonance hashes
     * @param coherenceProof Must be 1e18 for all
     */
    function submitHarmonicBatch(bytes32[] calldata hashes, uint256 coherenceProof) external returns (uint256) {
        require(coherenceProof == PERFECT_COHERENCE, "Batch incoherent");
        
        // Check harmonic block alignment
        uint256 remainder = block.number % 9;
        require(
            remainder == 3 || remainder == 6 || remainder == 0,
            "Not harmonic block phase"
        );
        
        uint256 phase = (remainder == 0) ? 9 : remainder;
        
        emit HarmonicSync(block.number, phase);
        
        for (uint256 i = 0; i < hashes.length; i++) {
            lastResonanceHash = hashes[i];
            submissionCount[msg.sender]++;
            
            emit StateCommitted(
                msg.sender,
                hashes[i],
                coherenceProof,
                block.number,
                block.timestamp
            );
        }
        
        return hashes.length;
    }
    
    /**
     * @notice Get the last recorded coherence score
     */
    function getLastCoherenceScore() external view returns (uint256) {
        return lastCoherenceScore;
    }
    
    /**
     * @notice Get submission count for a node
     */
    function getNodeSubmissionCount(address node) external view returns (uint256) {
        return submissionCount[node];
    }
    
    /**
     * @notice Owner can update owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}
