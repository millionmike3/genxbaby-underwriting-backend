import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const AppraisalService = {
  async orderAppraisal(applicationId: string, borrowerId: string, payload: any) {
    // TODO: Insert appraisal ordering logic
    const order = { orderId: "AP-001", status: "ORDERED" };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.APPRAISAL_ORDERED,
      {
        system: EventSystem.AppraisalService,
        ...order
      }
    );

    return order;
  },

  async handleAppraisalCallback(applicationId: string, borrowerId: string, report: any) {
    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.APPRAISAL_RECEIVED,
      {
        system: EventSystem.AppraisalService,
        ...report
      }
    );

    // TODO: Insert evaluation logic
    const evaluation = { value: 525000, asIs: 500000 };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.APPRAISAL_EVALUATED,
      {
        system: EventSystem.AppraisalService,
        ...evaluation
      }
    );

    return evaluation;
  }
};
