import { prisma } from '../../db/client'
import { createMerkleRoot } from '../merkle/merkle.service'

export const underwritingService = {
  async createCase(data: { borrowerId: number; mortgageId: number }) {
    return prisma.underwritingCase.create({ data })
  },

  async run(id: number) {
    const uw = await prisma.underwritingCase.findUnique({
      where: { id },
      include: { borrower: true, mortgage: true },
    })

    if (!uw) throw new Error('Underwriting case not found')

    const riskScore = this.computeRisk(uw)
    const collateralScore = this.computeCollateral(uw)
    const fraudScore = this.computeFraud(uw)
    const financialScore = this.computeFinancial(uw)
    const behaviorScore = this.computeBehavior(uw)

    const decision =
      riskScore < 0.3 || fraudScore > 0.7 ? 'DECLINE' : 'APPROVE'

    const merkleRoot = createMerkleRoot({
      borrowerId: uw.borrowerId,
      mortgageId: uw.mortgageId,
      riskScore,
      collateralScore,
      fraudScore,
      financialScore,
      behaviorScore,
      decision,
    })

    const updated = await prisma.underwritingCase.update({
      where: { id },
      data: {
        riskScore,
        collateralScore,
        fraudScore,
        financialScore,
        behaviorScore,
        decision,
        merkleRoot,
      },
    })

    return updated
  },

  computeRisk(uw: any) {
    const loan = uw.mortgage.loanAmount || 0
    const income = uw.borrower.annualIncome || 1
    const ratio = loan / income
    return Math.min(1, ratio / 5) // simple heuristic
  },

  computeCollateral(uw: any) {
    const mv = uw.mortgage.property?.marketValue || 0
    const loan = uw.mortgage.loanAmount || 0
    if (!mv || !loan) return 0.5
    const ltv = loan / mv
    return 1 - Math.min(1, ltv)
  },

  computeFraud(_uw: any) {
    return 0.1 // placeholder
  },

  computeFinancial(uw: any) {
    const cs = uw.borrower.creditScore || 600
    return Math.min(1, cs / 850)
  },

  computeBehavior(_uw: any) {
    return 0.5 // placeholder
  },
}
