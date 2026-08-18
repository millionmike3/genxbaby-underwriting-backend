import { TimelineEventService } from "../timelineEventService";
import { EventType } from "../../events/eventTypes";
import { EventSystem } from "../../events/eventSystems";

export const BlockchainAnchoringService = {
  async createMerkleSnapshot(applicationId: string, borrowerId: string, state: any) {
    const snapshot = { root: "abc123" };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.MERKLE_SNAPSHOT_CREATED,
      {
        system: EventSystem.BlockchainAnchoring,
        ...snapshot
      }
    );

    return snapshot;
  },

  async anchorToPolygon(applicationId: string, borrowerId: string, snapshot: any) {
    const receipt = { txHash: "0x123", blockNumber: 987654 };

    await TimelineEventService.logEvent(
      applicationId,
      borrowerId,
      EventType.ANCHOR_TX_MINED,
      {
        system: EventSystem.BlockchainAnchoring,
        ...receipt
      }
    );

    return receipt;
  }
};
