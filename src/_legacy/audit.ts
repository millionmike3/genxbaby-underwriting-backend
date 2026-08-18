// src/routes/audit.ts

import { Router } from "express";
import { prisma } from "../db";
import { computeRisk } from "../services/riskEngine";
import { generateMerkleSnapshot } from "../services/merkleSnapshot";
import { anchorMerkleRootOnPolygon } from "../services/polygonAnchor";

const router = Router();

/**
 * GET /audit/:applicationId
 * Returns full audit trail for underwriting decision
 */
router.get("/:applicationId", async (req, res) => {
  const { applicationId } = req.params;

  try {
    // Fetch application + borrower + documents
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        borrower: true,
        documents: true,
      },
    });

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Compute risk (same engine used during underwriting)
    const risk = computeRisk(app);

    // Build decision object
    const decision = {
      status: app.decisionStatus,
      tier: app.decisionTier,
      finalRate: app.decisionRate,
      notes: app.decisionNotes,
      timestamp: app.updatedAt.getTime(),
    };

    // Generate Merkle snapshot
    const snapshot = generateMerkleSnapshot({
      applicationId,
      status: decision.status,
      tier: decision.tier,
      finalRate: decision.finalRate,
      notes: decision.notes,
      timestamp: decision.timestamp,
    });

    // Anchor Merkle root on Polygon
    const anchor = await anchorMerkleRootOnPolygon(snapshot.merkleRoot);

    // Build audit response
    const auditResponse = {
      borrower: {
        fullName: app.borrower.fullName,
        address: app.borrower.address,
        ssn: app.borrower.ssnLast4,
        dob: app.borrower.dob,
        kycVerified: app.borrower.kycVerified,
      },
      loan: {
        purpose: app.purpose,
        amount: app.amount,
        propertyValue: app.propertyValue,
        ltv: app.ltv,
        dti: app.dti,
      },
      income: {
        employer: app.employer,
        amount: app.incomeAmount,
        years: app.incomeYears,
        verified: app.incomeVerified,
      },
      risk,
      decision,
      snapshot,
      anchor,
    };

    res.json(auditResponse);
  } catch (err) {
    console.error("Audit route error:", err);
    res.status(500).json({ message: "Failed to load audit data" });
  }
});

export default router;
