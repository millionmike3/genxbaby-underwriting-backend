// src/services/pricingEngine.ts
import { TimelineEventService } from "./timelineEventService";

export async function generatePricing(applicationId, borrowerId, input) {
  const pricingData = await calculatePricing(input); // your existing logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "PRICING_GENERATED",
    pricingData
  );

  return pricingData;
}
