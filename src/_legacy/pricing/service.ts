import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const PricingService = {
  async generatePricing(applicationId: string, borrowerId: string, input: any) {
    // TODO: Insert pricing logic
    const pricingData = {
      baseRate: 6.25,
      adjustments: { credit: 0.125, ltv: 0.25 },
      finalRate: 6.875
    };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.PRICING_GENERATED,
      {
        system: EventSystem.PricingEngine,
        ...pricingData
      }
    );

    return pricingData;
  }
};
