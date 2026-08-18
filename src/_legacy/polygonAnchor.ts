// src/services/polygonAnchor.ts

import { ethers } from "ethers";
import {
  POLYGON_RPC,
  GENXBABY_CONTRACT_ADDRESS,
  GENXBABY_CONTRACT_ABI
} from "../../blockchain/config";

/**
 * Create provider (server-side, no MetaMask)
 */
function getProvider() {
  return new ethers.JsonRpcProvider(POLYGON_RPC);
}

/**
 * Create signer (server-side)
 * Replace PRIVATE_KEY with your backend wallet key
 * This wallet will anchor underwriting decisions on-chain
 */
function getSigner() {
  const provider = getProvider();
  const privateKey = process.env.UNDERWRITING_ANCHOR_KEY;

  if (!privateKey) {
    throw new Error("Missing UNDERWRITING_ANCHOR_KEY in environment variables");
  }

  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get write-enabled contract instance
 */
function getContract() {
  const signer = getSigner();
  return new ethers.Contract(
    GENXBABY_CONTRACT_ADDRESS,
    GENXBABY_CONTRACT_ABI,
    signer
  );
}

/**
 * Normalize hex to bytes32
 */
function normalizeBytes32(hex: string): string {
  if (!hex.startsWith("0x")) hex = "0x" + hex;
  if (hex.length !== 66) {
    throw new Error(`Invalid bytes32 length: ${hex.length}`);
  }
  return hex;
}

/**
 * Anchor Merkle root on Polygon
 */
export async function anchorMerkleRootOnPolygon(merkleRoot: string) {
  try {
    const normalizedRoot = normalizeBytes32(merkleRoot);
    const contract = getContract();

    console.log("Anchoring Merkle Root:", normalizedRoot);

    const tx = await contract.anchorMerkleRoot(normalizedRoot);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      root: normalizedRoot,
    };
  } catch (err: any) {
    console.error("Polygon anchoring error:", err);
    return {
      success: false,
      error: err.message || "Unknown error anchoring Merkle root",
    };
  }
}
