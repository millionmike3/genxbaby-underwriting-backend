// src/services/insuranceService.ts
import { TimelineEventService } from "./timelineEventService";

export async function requestInsuranceQuote(applicationId, borrowerId, property) {
  const quote = await fetchQuote(property); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "INSURANCE_QUOTE_RECEIVED",
    quote
  );

  return quote;
}

export async function selectPolicy(applicationId, borrowerId, policy) {
  const savedPolicy = await savePolicy(policy); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "INSURANCE_POLICY_SELECTED",
    savedPolicy
  );

  return savedPolicy;
}
