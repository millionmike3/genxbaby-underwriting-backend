import { Worker } from './connection'
import { notificationQueue } from '../queue/queues'
import { prisma } from '../db/client'
import { anchorMerkleRoot } from '../services/anchor/anchor.service'

export const anchoringWorker = new Worker(
  'anchoring',
  async job => {
    const { caseId, merkleRoot } = job.data as { caseId: number; merkleRoot: string }

    const anchorResult = await anchorMerkleRoot(merkleRoot);

   await prisma.underwritingCase.update({
   where: { id: caseId },
   data: {
    anchoredTxHash: anchorResult.txHash,
    // optional fields if you add them to schema:
    // anchoredBlock: anchorResult.blockNumber,
    // anchoredAt: new Date(anchorResult.anchoredAt)
   }
  });

   await notificationQueue.add("anchored", {
   caseId,
   merkleRoot,
   txHash: anchorResult.txHash,
   blockNumber: anchorResult.blockNumber,
   anchoredAt: anchorResult.anchoredAt
  });

    return { caseId, txHash }
  },
  { connection: require('../queue/connection').connection }
)
