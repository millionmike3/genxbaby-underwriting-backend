"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anchorMerkleRoot = void 0;
const contract_1 = require("../blockchain/contract");
const anchorMerkleRoot = async (root) => {
    const tx = await contract_1.contract.anchor(root);
    const receipt = await tx.wait();
    return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        anchoredAt: Date.now()
    };
};
exports.anchorMerkleRoot = anchorMerkleRoot;
