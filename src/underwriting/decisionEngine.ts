import { verifyIncome } from "./incomeVerification";
import { calculateLTV } from "./ltvCalculator";
import { calculateDTI } from "./dtiCalculator";
import { detectFraud } from "./fraudSignals";
import { mapRiskTier } from "./riskTier";
import { pricingForTier } from "./pricingModel";

export function runUnderwriting(application, borrower) {
  const income = verifyIncome(application.incomeAmount, application.incomeYears);
  const ltv = calculateLTV(application.amount, application.propertyValue);
  const dti = calculateDTI(application.monthlyDebt || 0, application.incomeAmount / 12);

  const fraud = detectFraud(application, borrower);

  // Risk score calculation
  let score =
    income.combined * 400 +
    (1 - ltv) * 300 +
    (1 - dti) * 300 -
    fraud.riskPenalty;

  score = Math.max(0, Math.min(score, 1000)); // clamp

  const tier = mapRiskTier(score);
  const rate = pricingForTier(tier);

  const decision =
    tier === "HIGH_RISK" ? "DECLINED" :
    tier === "D" ? "NEEDS_MORE_INFO" :
    "APPROVED";

  return {
    score,
    tier,
    rate,
    decision,
    fraudSignals: fraud.signals
  };
}
