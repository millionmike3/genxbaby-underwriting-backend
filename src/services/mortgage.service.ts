import { prisma } from '../db/client'
const mortgage = await prisma.mortgage.create({ data });

const uwCase = await prisma.underwritingCase.create({
  data: {
    borrowerId: mortgage.borrowerId,
    mortgageId: mortgage.id,
  },
});

await underwritingCaseQueue.add("run", { caseId: uwCase.id });

return { mortgage, uwCase };

export const mortgageService = {
  async create(data: any) {
    return prisma.mortgage.create({ data })
  },
}
