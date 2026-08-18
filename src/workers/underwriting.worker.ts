import { Worker } from './connection'
import { underwritingCaseQueue, anchoringQueue, notificationQueue } from '../queue/queues'
import { underwritingService } from '../services/underwriting/engine'

export const underwritingWorker = new Worker(
  'underwriting-case',
  async job => {
    const { caseId } = job.data as { caseId: number }

    const result = await underwritingService.run(caseId)

    // enqueue anchoring
    await anchoringQueue.add('anchor', {
      caseId,
      merkleRoot: result.merkleRoot,
    })

    // enqueue notification: decision
    await notificationQueue.add('decision', {
      caseId,
      decision: result.decision,
      riskScore: result.riskScore,
      collateralScore: result.collateralScore,
      fraudScore: result.fraudScore,
      financialScore: result.financialScore,
      behaviorScore: result.behaviorScore,
    })
     await prisma.underwritingCase.update({
     where: { id: caseId },
     data: {
     anchoredTxHash: anchorResult.txHash,
     anchoredBlock: anchorResult.blockNumber,
     anchoredAt: new Date(anchorResult.anchoredAt),
     },
    })

    return result
  },
  { connection: require('../queue/connection').connection }
)
