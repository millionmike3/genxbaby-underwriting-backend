import { contract } from "../blockchain/contract";

export type AnchorResult = {
  txHash: string;
  blockNumber: number;
  anchoredAt: number;
};

export const anchorMerkleRoot = async (root: string): Promise<AnchorResult> => {
  const tx = await contract.anchor(root);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    anchoredAt: Date.now()
  };
};
