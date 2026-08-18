import { keccak256 } from "ethers";

export const generateMerkleRoot = (payload) => {
  const leaves = Object.values(payload).map((v) => keccak256(Buffer.from(String(v))));
  const root = keccak256(Buffer.concat(leaves));
  return root;
};
