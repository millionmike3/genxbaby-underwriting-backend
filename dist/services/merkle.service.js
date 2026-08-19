"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMerkleRoot = void 0;
const ethers_1 = require("ethers");
const generateMerkleRoot = (payload) => {
    const leaves = Object.values(payload).map((v) => (0, ethers_1.keccak256)(Buffer.from(String(v))));
    const root = (0, ethers_1.keccak256)(Buffer.concat(leaves));
    return root;
};
exports.generateMerkleRoot = generateMerkleRoot;
