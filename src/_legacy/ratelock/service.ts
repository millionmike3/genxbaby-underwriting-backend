import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const RateLockService = {
  async createRateLock(applicationId: string, borrowerId: string, pricing: any) {
    const lock = { lockId: "RL-001", rate: pricing.finalRate };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.RATE_LOCK_CREATED,
      {
        system: EventSystem.RateLockEngine,
        ...lock
      }
    );

    return lock;
  },

  async validateRateLock(applicationId: string, borrowerId: string, lock: any) {
    const result = { valid: true };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.RATE_LOCK_VALIDATED,
      {
        system: EventSystem.RateLockEngine,
        ...result
      }
    );

    return result;
  }
};
