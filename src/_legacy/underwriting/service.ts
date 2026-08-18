import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const UnderwritingService = {
  async issueDecision(applicationId: string, borrowerId: string, file: any) {
    // TODO: Insert underwriting logic
    const decision = {
      status: "CONDITIONAL",
      tier: "A2",
      conditions: ["Updated bank statements", "Insurance proof"]
    };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.UW_DECISION_ISSUED,
      {
        system: EventSystem.UnderwritingEngine,
        ...decision
      }
    );

    if (decision.conditions?.length) {
      await TimelineEventService.logEvent(
        applicationId,
        borrowerId,
        EventType.UW_CONDITIONS_CREATED,
        {
          system: EventSystem.UnderwritingEngine,
          conditions: decision.conditions
        }
      );
    }

    return decision;
  }
};
