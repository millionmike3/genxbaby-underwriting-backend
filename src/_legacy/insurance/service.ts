import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const InsuranceService = {
  async requestQuote(applicationId: string, borrowerId: string, property: any) {
    // TODO: Insert insurance quote logic
    const quote = { premium: 1200, provider: "StateFarm" };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.INSURANCE_QUOTE_RECEIVED,
      {
        system: EventSystem.InsuranceService,
        ...quote
      }
    );

    return quote;
  },

  async selectPolicy(applicationId: string, borrowerId: string, policy: any) {
    // TODO: Insert policy selection logic
    const savedPolicy = { ...policy, selected: true };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.INSURANCE_POLICY_SELECTED,
      {
        system: EventSystem.InsuranceService,
        ...savedPolicy
      }
    );

    return savedPolicy;
  }
};
