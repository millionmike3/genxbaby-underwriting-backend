// src/services/closingService.ts
import { TimelineEventService } from "./timelineEventService";

export async function generateCommitmentLetter(applicationId, borrowerId, data) {
  const letter = await buildCommitmentLetter(data); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "COMMITMENT_LETTER_ISSUED",
    { url: letter.url, terms: letter.terms }
  );

  return letter;
}

export async function generateClosingDisclosure(applicationId, borrowerId, data) {
  const cd = await buildClosingDisclosure(data); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "CLOSING_DISCLOSURE_ISSUED",
    { url: cd.url, apr: cd.apr, cashToClose: cd.cashToClose }
  );

  return cd;
}

export async function fundLoan(applicationId, borrowerId, funding) {
  const result = await executeFunding(funding); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "FUNDED",
    result
  );

  return result;
}
