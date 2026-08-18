import { prisma } from "@/db/prisma";
import { runUnderwritingEngine } from "@/services/underwriting/engine";
import { generateMerkleRoot } from "@/services/merkle/merkle.service";
import { anchorMerkleRoot } from "@/services/anchor/anchor.service";
import { logAudit } from "@/services/audit/log";

/**
 * Batch Anchoring Service
 *
 * Anchors multiple underwriting decisions in a single batch.
 * Produces:
 *  - batch Merkle root
 *  - Polygon txHash
 *  - block number
 *  - anchor timestamp
 *  - anchor records linked to batch
 */
export async function batchAnchorApplications(applicationIds: string[]) {
  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    throw new Error("applicationIds must be a non-empty array");
  }

  const anchorRecords: any[] = [];

  // Step 1 — Run underwriting + generate individual Merkle roots
  for (const applicationId of applicationIds) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        property: true,
        stockSnapshot: true
      }
    });

    if (!application) {
      anchorRecords.push({
        applicationId,
        error: "Application not found"
      });
      continue;
    }

    const underwriting = await runUnderwritingEngine({
      application,
      behavior: application.behaviorResult,
      property: application.propertyResult,
      stock: application.stockResult
    });

    const merkleRoot = generateMerkleRoot(underwriting.payload);

    anchorRecords.push({
      applicationId,
      merkleRoot,
      riskScore: underwriting.riskScore
    });
  }

  // Step 2 — Generate batch Merkle root from all individual roots
  const batchMerkleRoot = generateMerkleRoot(
    anchorRecords.map((r) => r.merkleRoot)
  );

  // Step 3 — Anchor batch Merkle root on Polygon
  const anchor = await anchorMerkleRoot(batchMerkleRoot);

  // Step 4 — Create batch record
  const batch = await prisma.anchorBatch.create({
    data: {
      merkleRoot: batchMerkleRoot,
      txHash: anchor.txHash,
      blockNumber: anchor.blockNumber,
      anchoredAt: anchor.anchoredAt
    }
  });

  // Step 5 — Link individual anchor records to batch
  for (const record of anchorRecords) {
    if (record.error) continue;

    await prisma.anchorRecord.create({
      data: {
        applicationId: record.applicationId,
        merkleRoot: record.merkleRoot,
        txHash: anchor.txHash,
        blockNumber: anchor.blockNumber,
        anchoredAt: anchor.anchoredAt,
        batchId: batch.id,
        riskScore: record.riskScore
      }
    });
  }

  // Step 6 — Audit log
  await logAudit({
    actor: "admin",
    action: "BATCH_ANCHOR",
    target: batch.id,
    metadata: {
      applicationIds,
      batchMerkleRoot,
      txHash: anchor.txHash,
      blockNumber: anchor.blockNumber
    }
  });

  return {
    batch,
    anchorRecords,
    anchor
  };
}
