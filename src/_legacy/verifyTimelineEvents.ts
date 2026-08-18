// src/tests/verifyTimelineEvents.ts

import { PricingService } from "../services/pricing/service";
import { UnderwritingService } from "../services/underwriting/service";
import { AppraisalService } from "../services/appraisal/service";
import { InsuranceService } from "../services/insurance/service";
import { TitleService } from "../services/title/service";
import { RateLockService } from "../services/ratelock/service";
import { ClosingService } from "../services/closing/service";
import { InvestorDeliveryService } from "../services/investor/service";
import { BlockchainAnchoringService } from "../services/blockchain/service";

import { prisma } from "../lib/prisma"; // adjust if your prisma client path differs

const applicationId = "TEST-APP-001";
const borrowerId = "TEST-BORROWER-001";

async function runVerification() {
  console.log("🔍 Starting GENXBABY Timeline Verification...\n");

  // 1. Pricing Engine
  console.log("➡️ Pricing Engine...");
  await PricingService.generatePricing(applicationId, borrowerId, { product: "DSCR" });

  // 2. Underwriting Engine
  console.log("➡️ Underwriting Engine...");
  await UnderwritingService.issueDecision(applicationId, borrowerId, { file: "dummy" });

  // 3. Appraisal Service
  console.log("➡️ Appraisal Service...");
  await AppraisalService.orderAppraisal(applicationId, borrowerId, { address: "123 Main St" });
  await AppraisalService.handleAppraisalCallback(applicationId, borrowerId, { reportId: "RPT-001" });

  // 4. Insurance Service
  console.log("➡️ Insurance Service...");
  await InsuranceService.requestQuote(applicationId, borrowerId, { property: "123 Main St" });
  await InsuranceService.selectPolicy(applicationId, borrowerId, { policyId: "POL-001" });

  // 5. Title Service
  console.log("➡️ Title Service...");
  await TitleService.orderTitle(applicationId, borrowerId, { address: "123 Main St" });
  await TitleService.handleCommitment(applicationId, borrowerId, { commitmentId: "TC-001" });

  // 6. Rate Lock Engine
  console.log("➡️ Rate Lock Engine...");
  await RateLockService.createRateLock(applicationId, borrowerId, { finalRate: 6.875 });
  await RateLockService.validateRateLock(applicationId, borrowerId, { lockId: "RL-001" });

  // 7. Closing Engine
  console.log("➡️ Closing Engine...");
  await ClosingService.generateCommitmentLetter(applicationId, borrowerId, { terms: "Standard" });
  await ClosingService.generateClosingDisclosure(applicationId, borrowerId, { apr: 7.12 });
  await ClosingService.fundLoan(applicationId, borrowerId, { amount: 450000 });

  // 8. Investor Delivery Engine
  console.log("➡️ Investor Delivery Engine...");
  await InvestorDeliveryService.createDeliveryPackage(applicationId, borrowerId, { loanId: "LN-001" });
  await InvestorDeliveryService.markLoanSold(applicationId, borrowerId, { investor: "BlackRock" });

  // 9. Blockchain Anchoring Engine
  console.log("➡️ Blockchain Anchoring...");
  const snapshot = await BlockchainAnchoringService.createMerkleSnapshot(applicationId, borrowerId, { state: "dummy" });
  await BlockchainAnchoringService.anchorToPolygon(applicationId, borrowerId, snapshot);

  console.log("\n📥 Fetching timeline events from database...\n");

  const events = await prisma.timelineEvent.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" }
  });

  console.log("📊 Timeline Events:");
  console.log(JSON.stringify(events, null, 2));

  console.log("\n✅ Verification Complete — All engines tested.");
}

runVerification()
  .catch((err) => {
    console.error("❌ Verification failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
