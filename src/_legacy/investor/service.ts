import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const InvestorDeliveryService = {
  async createDeliveryPackage(applicationId: string, borrowerId: string, loan: any) {
    const pkg = { url: "/docs/delivery.zip", investor: "BlackRock" };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.DELIVERY_PACKAGE_CREATED,
      {
        system: EventSystem.InvestorDeliveryEngine,
        ...pkg
      }
    );

    return pkg;
  },

  async markLoanSold(applicationId: string, borrowerId: string, sale: any) {
    const result = { sold: true, investor: sale.investor };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.LOAN_SOLD,
      {
        system: EventSystem.InvestorDeliveryEngine,
        ...result
      }
    );

    return result;
  }
};
