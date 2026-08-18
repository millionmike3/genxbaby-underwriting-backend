import { prisma } from "../db";

export const TimelineEventService = {
  /**
   * Create a timeline event
   */
  async createEvent({
    applicationId,
    borrowerId,
    eventType,
    payload = null
  }) {
    return prisma.timelineEvent.create({
      data: {
        applicationId,
        borrowerId,
        eventType,
        payload
      }
    });
  },

  /**
   * Get all events for an application
   */
  async getApplicationTimeline(applicationId) {
    return prisma.timelineEvent.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" }
    });
  },

  /**
   * Get all events for a borrower (across all applications)
   */
  async getBorrowerTimeline(borrowerId) {
    return prisma.timelineEvent.findMany({
      where: { borrowerId },
      orderBy: { createdAt: "asc" }
    });
  },

  /**
   * Log an event with auto-generated title
   */
  async logEvent(applicationId, borrowerId, eventType, payload = null) {
    return this.createEvent({
      applicationId,
      borrowerId,
      eventType,
      payload
    });
  }
};
