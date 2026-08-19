"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashLeaf = hashLeaf;
exports.generateMerkleRoot = generateMerkleRoot;
exports.createMerkleRoot = createMerkleRoot;
const ethers_1 = require("ethers");
const buffer_1 = require("buffer");
/**
 * Hash a single leaf using keccak256
 */
function hashLeaf(leaf) {
    return (0, ethers_1.keccak256)(buffer_1.Buffer.from(leaf));
}
/**
 * Convert a keccak256 hex string into a Buffer
 */
function hexToBuffer(hex) {
    return buffer_1.Buffer.from(hex.replace(/^0x/, ""), "hex");
}
/**
 * Generate a Merkle-like root from an array of string leaves.
 * This is NOT a full Merkle tree — it is a deterministic batch hash
 * suitable for anchoring on-chain.
 *
 * Example leaf format:
 *   `${caseId}:${riskScore}`
 */
function generateMerkleRoot(leaves) {
    if (!Array.isArray(leaves) || leaves.length === 0) {
        throw new Error("generateMerkleRoot requires a non-empty array");
    }
    // Step 1 — Hash each leaf
    const hashedLeaves = leaves.map(leaf => hashLeaf(leaf));
    // Step 2 — Convert each hex hash into a Buffer
    const buffers = hashedLeaves.map(hex => hexToBuffer(hex));
    // Step 3 — Concatenate all leaf buffers
    const concatenated = buffer_1.Buffer.concat(buffers);
    // Step 4 — Hash the concatenation to produce the Merkle root
    return (0, ethers_1.keccak256)(concatenated);
}
/**
 * Legacy JSON-based Merkle root (kept for compatibility)
 * Some parts of your old system used this.
 */
function createMerkleRoot(payload) {
    const json = JSON.stringify(payload);
    return (0, ethers_1.keccak256)(buffer_1.Buffer.from(json));
}
