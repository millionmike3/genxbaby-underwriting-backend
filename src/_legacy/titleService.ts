// src/services/titleService.ts
import { TimelineEventService } from "./timelineEventService";

export async function orderTitle(applicationId, borrowerId, payload) {
  const order = await sendTitleOrder(payload); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "TITLE_ORDERED",
    order
  );

  return order;
}

export async function handleTitleCommitment(applicationId, borrowerId, commitment) {
  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "TITLE_COMMITMENT_RECEIVED",
    commitment
  );

  const validation = await validateLiens(commitment); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "TITLE_LIENS_VALIDATED",
    validation
  );

  return validation;
}
