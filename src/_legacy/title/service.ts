import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const TitleService = {
  async orderTitle(applicationId: string, borrowerId: string, payload: any) {
    const order = { orderId: "T-001", status: "ORDERED" };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.TITLE_ORDERED,
      {
        system: EventSystem.TitleService,
        ...order
      }
    );

    return order;
  },

  async handleCommitment(applicationId: string, borrowerId: string, commitment: any) {
    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.TITLE_COMMITMENT_RECEIVED,
      {
        system: EventSystem.TitleService,
        ...commitment
      }
    );

    const validation = { liens: [], clear: true };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.TITLE_LIENS_VALIDATED,
      {
        system: EventSystem.TitleService,
        ...validation
      }
    );

    return validation;
  }
};
