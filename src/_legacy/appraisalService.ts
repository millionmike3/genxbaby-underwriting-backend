// src/services/appraisalService.ts
import { TimelineEventService } from "./timelineEventService";

export async function orderAppraisal(applicationId, borrowerId, payload) {
  const order = await sendOrderToAMC(payload); // your existing logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "APPRAISAL_ORDERED",
    order
  );

  return order;
}

export async function handleAppraisalCallback(applicationId, borrowerId, report) {
  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "APPRAISAL_RECEIVED",
    report
  );

  const evaluation = await evaluateAppraisal(report); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "APPRAISAL_EVALUATED",
    evaluation
  );

  return evaluation;
}
