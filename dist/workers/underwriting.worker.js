"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.underwritingWorker = exports.notificationQueue = exports.anchoringQueue = void 0;
const connection_1 = require("./connection");
const client_1 = require("@prisma/client");
const bullmq_1 = require("bullmq");
const connection_2 = require("./connection");
const prisma = new client_1.PrismaClient();
// Queues
exports.anchoringQueue = new bullmq_1.Queue("anchoring", { connection: connection_2.connection });
exports.notificationQueue = new bullmq_1.Queue("notifications", { connection: connection_2.connection });
/**
 * Underwriting Worker (Mortgage Underwriting System)
 *
 * This worker:
 *  - loads the underwriting case
 *  - computes a risk score
 *  - updates the case
 *  - enqueues anchoring
 *  - enqueues notifications
 */
exports.underwritingWorker = new connection_1.Worker("underwriting", async (job) => {
    const { caseId } = job.data;
    // Load underwriting case with borrower + mortgage
    const uwCase = await prisma.underwritingCase.findUnique({
        where: { id: caseId },
        include: {
            borrower: true,
            mortgage: {
                include: { property: true }
            }
        }
    });
    if (!uwCase) {
        throw new Error(`Underwriting case ${caseId} not found`);
    }
    // Simple risk scoring model (placeholder)
    const creditScore = uwCase.borrower.creditScore ?? 600;
    const riskScore = creditScore / 850;
    // Update underwriting case with risk score
    await prisma.underwritingCase.update({
        where: { id: caseId },
        data: { riskScore }
    });
    // Enqueue anchoring job
    await exports.anchoringQueue.add("anchor", {
        caseId,
        leaf: `${caseId}:${riskScore}`
    });
    // Enqueue notification job
    await exports.notificationQueue.add("decision", {
        type: "UNDERWRITING_COMPLETE",
        message: `Underwriting completed for case ${caseId} with risk score ${riskScore}`
    });
    return { caseId, riskScore };
}, { connection: connection_2.connection });
