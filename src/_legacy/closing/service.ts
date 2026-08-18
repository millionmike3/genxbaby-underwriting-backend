import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const ClosingService = {
  async generateCommitmentLetter(applicationId: string, borrowerId: string, data: any) {
    const letter = { url: "/docs/commitment.pdf", terms: data };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.COMMITMENT_LETTER_ISSUED,
      {
        system: EventSystem.ClosingEngine,
        ...letter
      }
    );

    return letter;
  },

  async generateClosingDisclosure(applicationId: string, borrowerId: string, data: any) {
    const cd = { url: "/docs/cd.pdf", apr: 7.12, cashToClose: 32000 };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.CLOSING_DISCLOSURE_ISSUED,
      {
        system: EventSystem.ClosingEngine,
        ...cd
      }
    );

    return cd;
  },

  async fundLoan(applicationId: string, borrowerId: string, funding: any) {
    const result = { funded: true, timestamp: Date.now() };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.FUNDED,
      {
        system: EventSystem.ClosingEngine,
        ...result
      }
    );

    return result;
  }
};
