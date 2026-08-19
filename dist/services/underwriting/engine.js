"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.underwritingService = void 0;
const client_1 = require("../../db/client");
const merkle_service_1 = require("../merkle/merkle.service");
exports.underwritingService = {
    async createCase(data) {
        return client_1.prisma.underwritingCase.create({ data });
    },
    async run(id) {
        const uw = await client_1.prisma.underwritingCase.findUnique({
            where: { id },
            include: { borrower: true, mortgage: true },
        });
        if (!uw)
            throw new Error('Underwriting case not found');
        const riskScore = this.computeRisk(uw);
        const collateralScore = this.computeCollateral(uw);
        const fraudScore = this.computeFraud(uw);
        const financialScore = this.computeFinancial(uw);
        const behaviorScore = this.computeBehavior(uw);
        const decision = riskScore < 0.3 || fraudScore > 0.7 ? 'DECLINE' : 'APPROVE';
        const merkleRoot = (0, merkle_service_1.createMerkleRoot)({
            borrowerId: uw.borrowerId,
            mortgageId: uw.mortgageId,
            riskScore,
            collateralScore,
            fraudScore,
            financialScore,
            behaviorScore,
            decision,
        });
        const updated = await client_1.prisma.underwritingCase.update({
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
        });
        return updated;
    },
    computeRisk(uw) {
        const loan = uw.mortgage.loanAmount || 0;
        const income = uw.borrower.annualIncome || 1;
        const ratio = loan / income;
        return Math.min(1, ratio / 5); // simple heuristic
    },
    computeCollateral(uw) {
        const mv = uw.mortgage.property?.marketValue || 0;
        const loan = uw.mortgage.loanAmount || 0;
        if (!mv || !loan)
            return 0.5;
        const ltv = loan / mv;
        return 1 - Math.min(1, ltv);
    },
    computeFraud(_uw) {
        return 0.1; // placeholder
    },
    computeFinancial(uw) {
        const cs = uw.borrower.creditScore || 600;
        return Math.min(1, cs / 850);
    },
    computeBehavior(_uw) {
        return 0.5; // placeholder
    },
};
