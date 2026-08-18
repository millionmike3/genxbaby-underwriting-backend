import { contract } from "../blockchain/contract";

export const anchorMerkleRoot = async (root) => {
  const tx = await contract.anchor(root);
  return await tx.wait();
};
