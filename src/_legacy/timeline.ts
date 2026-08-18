import { Router } from "express";
import { TimelineEventService } from "../services/timelineEventService";

const router = Router();

/**
 * POST /timeline/event
 * Create a new timeline event
 */
router.post("/event", async (req, res) => {
  try {
    const {
      applicationId,
      borrowerId,
      eventType,
      title,
      description,
      payload
    } = req.body;

    if (!applicationId || !borrowerId || !eventType) {
      return res.status(400).json({
        message: "applicationId, borrowerId, and eventType are required"
      });
    }

    const event = await TimelineEventService.createEvent({
      applicationId,
      borrowerId,
      eventType,
      title,
      description,
      payload
    });

    res.json({ success: true, event });
  } catch (err) {
    console.error("Timeline event creation error:", err);
    res.status(500).json({ message: "Failed to create timeline event" });
  }
});

/**
 * GET /timeline/application/:applicationId
 * Get all timeline events for an application
 */
router.get("/application/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const events = await TimelineEventService.getApplicationTimeline(
      applicationId
    );

    res.json({ applicationId, events });
  } catch (err) {
    console.error("Get application timeline error:", err);
    res.status(500).json({ message: "Failed to fetch application timeline" });
  }
});

/**
 * GET /timeline/borrower/:borrowerId
 * Get all timeline events for a borrower
 */
router.get("/borrower/:borrowerId", async (req, res) => {
  try {
    const { borrowerId } = req.params;

    const events = await TimelineEventService.getBorrowerTimeline(borrowerId);

    res.json({ borrowerId, events });
  } catch (err) {
    console.error("Get borrower timeline error:", err);
    res.status(500).json({ message: "Failed to fetch borrower timeline" });
  }
});

export default router;
