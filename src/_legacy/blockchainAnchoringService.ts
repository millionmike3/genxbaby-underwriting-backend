// src/services/blockchainAnchoringService.ts
import { TimelineEventService } from "./timelineEventService";

export async function createMerkleSnapshot(applicationId, borrowerId, state) {
  const snapshot = await buildMerkleTree(state); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "MERKLE_SNAPSHOT_CREATED",
    { root: snapshot.root }
  );

  return snapshot;
}

export async function anchorToPolygon(applicationId, borrowerId, snapshot) {
  const receipt = await sendAnchorTx(snapshot.root); // your logic

  await TimelineEventService.logEvent(
    applicationId,
    borrowerId,
    "ANCHOR_TX_MINED",
    { txHash: receipt.txHash, blockNumber: receipt.blockNumber }
  );

  return receipt;
}
