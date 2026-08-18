// src/services/underwritingService.ts
import { TimelineEventService } from "./timelineEventService";

export async function issueDecision(applicationId, borrowerId, file) {
  const decision = await runUnderwriting(file); // your existing logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "UW_DECISION_ISSUED",
    decision
  );

  if (decision.conditions?.length) {
    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      "UW_CONDITIONS_CREATED",
      { conditions: decision.conditions }
    );
  }

  return decision;
}
