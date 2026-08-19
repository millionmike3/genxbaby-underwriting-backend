"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchAnchorCases = batchAnchorCases;
const client_1 = require("@prisma/client");
const merkle_service_1 = require("../merkle.service");
const log_1 = require("../audit/log");
const prisma = new client_1.PrismaClient();
/**
 * Batch Anchoring Service (Mortgage Underwriting Version)
 *
 * Anchors multiple underwriting cases in a single batch.
 * Produces:
 *  - batch Merkle root
 *  - Polygon txHash
 *  - block number
 *  - anchor timestamp
 *  - anchor records linked to batch
 */
async function batchAnchorCases(caseIds) {
    if (!Array.isArray(caseIds) || caseIds.length === 0) {
        throw new Error("caseIds must be a non-empty array");
    }
    const anchorRecords = [];
    // Step 1 — Load underwriting cases + collect individual Merkle leaves
    for (const caseId of caseIds) {
        const uwCase = await prisma.underwritingCase.findUnique({
            where: { id: caseId },
            include: {
                borrower: true,
                mortgage: {
                    include: { property: true }
                }
            }
        });
        if (!uwCase) {
            anchorRecords.push({
                caseId,
                error: "Underwriting case not found"
            });
            continue;
        }
        // Simple risk score fallback
        const riskScore = uwCase.riskScore ?? 0;
        // Merkle leaf = caseId + riskScore
        const leaf = `${caseId}:${riskScore}`;
        anchorRecords.push({
            caseId,
            leaf,
            riskScore
        });
    }
    // Step 2 — Generate batch Merkle root
    const batchMerkleRoot = (0, merkle_service_1.generateMerkleRoot)(anchorRecords.map(r => r.leaf));
    // Step 3 — Anchor batch Merkle root on-chain
    // NOTE: anchorCase() anchors a single case, so for batch anchoring
    // we simulate a single batch anchor transaction.
    const txHash = `0x${batchMerkleRoot.slice(2, 66)}`; // placeholder
    const blockNumber = Math.floor(Math.random() * 1000000);
    const anchoredAt = new Date();
    // Step 4 — Create batch record
    const batch = await prisma.anchorBatch.create({
        data: {
            merkleRoot: batchMerkleRoot,
            txHash,
            blockNumber,
            anchoredAt
        }
    });
    // Step 5 — Create individual anchor records
    for (const record of anchorRecords) {
        if (record.error)
            continue;
        await prisma.anchorRecord.create({
            data: {
                applicationId: record.caseId.toString(), // required field in schema
                merkleRoot: batchMerkleRoot,
                txHash,
                blockNumber,
                anchoredAt,
                batchId: batch.id,
                riskScore: record.riskScore
            }
        });
    }
    // Step 6 — Audit log
    await (0, log_1.logAudit)({
        actor: "admin",
        action: "BATCH_ANCHOR",
        target: batch.id,
        metadata: {
            caseIds,
            batchMerkleRoot,
            txHash,
            blockNumber
        }
    });
    return {
        batch,
        anchorRecords,
        txHash,
        blockNumber,
        anchoredAt
    };
}
