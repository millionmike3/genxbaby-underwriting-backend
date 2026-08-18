// src/services/merkleSnapshot.ts

import crypto from "crypto";

/**
 * Hash helper (SHA-256 → hex → 0x-prefixed)
 */
function sha256(data: string): string {
  return "0x" + crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Normalize underwriting decision into deterministic JSON
 */
export function normalizeDecision(decision: any) {
  return JSON.stringify(
    {
      applicationId: decision.applicationId,
      status: decision.status,
      tier: decision.tier,
      finalRate: decision.finalRate,
      notes: decision.notes,
      timestamp: decision.timestamp,
    },
    Object.keys({
      applicationId: "",
      status: "",
      tier: "",
      finalRate: "",
      notes: "",
      timestamp: "",
    }).sort()
  );
}

/**
 * Build Merkle tree from array of leaf hashes
 */
function buildMerkleTree(leaves: string[]) {
  if (leaves.length === 0) {
    return { tree: [], root: null };
  }

  let level = [...leaves];
  const tree: string[][] = [level];

  while (level.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left; // duplicate last if odd count

      const combined = left + right.replace("0x", "");
      const parentHash = sha256(combined);

      nextLevel.push(parentHash);
    }

    level = nextLevel;
    tree.push(level);
  }

  return {
    tree,
    root: level[0],
  };
}

/**
 * Generate Merkle snapshot for underwriting decision
 */
export function generateMerkleSnapshot(decision: any) {
  // Normalize decision → deterministic JSON
  const normalized = normalizeDecision(decision);

  // Hash leaf
  const leaf = sha256(normalized);

  // Build Merkle tree (single leaf → root = leaf)
  const { tree, root } = buildMerkleTree([leaf]);

  return {
    leaf,
    tree,
    merkleRoot: root,
    anchorReadyRoot: root, // ready for Polygon smart contract
  };
}
