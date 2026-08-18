import { keccak256 } from "ethers";
import crypto from 'crypto'

export function createMerkleRoot(payload: Record<string, any>): string {
  const json = JSON.stringify(payload)
  return crypto.createHash('sha256').update(json).digest('hex')
}

export const generateMerkleRoot = (payload: Record<string, any>): string => {
  const entries = Object.entries(payload).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const leaves = entries.map(([key, value]) => {
    const leafString = `${key}:${JSON.stringify(value)}`;
    return keccak256(Buffer.from(leafString));
  });

  const concatenated = Buffer.concat(
    leaves.map((leaf) => Buffer.from(leaf.slice(2), "hex"))
  );

  return keccak256(concatenated);
};
