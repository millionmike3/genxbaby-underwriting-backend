// src/routes/underwriting.ts
import { Router } from "express";
import { prisma } from "../db";
import { computeRisk } from "../services/riskEngine";
import { saveDecision } from "../services/decisionService";

const router = Router();

// GET /underwriting/application/:id
router.get("/application/:id", async (req, res) => {
  const { id } = req.params;

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      borrower: true,
      documents: true,
    },
  });

  if (!app) {
    return res.status(404).json({ message: "Application not found" });
  }

  const risk = computeRisk(app);

  const response = {
    borrower: {
      fullName: app.borrower.fullName,
      ssn: app.borrower.ssnLast4,
      dob: app.borrower.dob,
      address: app.borrower.address,
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
    documents: app.documents.map((d) => ({
      name: d.name,
      verified: d.verified,
    })),
    decision: {
      tier: app.decisionTier,
      finalRate: app.decisionRate,
      status: app.decisionStatus,
      notes: app.decisionNotes,
    },
  };

  res.json(response);
});

// POST /underwriting/decision/:id
router.post("/decision/:id", async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!["APPROVED", "DECLINED", "NEEDS_MORE_INFO"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) {
    return res.status(404).json({ message: "Application not found" });
  }

  const updated = await saveDecision(id, status, notes || "");
  res.json(updated);
});

export default router;
