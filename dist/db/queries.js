"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBorrower = createBorrower;
exports.getBorrowerById = getBorrowerById;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.getApplicationWithBorrower = getApplicationWithBorrower;
exports.listApplications = listApplications;
exports.attachDocument = attachDocument;
exports.saveRiskScore = saveRiskScore;
exports.saveDecision = saveDecision;
exports.getFullUnderwritingFile = getFullUnderwritingFile;
exports.createMortgage = createMortgage;
exports.getMortgageById = getMortgageById;
exports.createUnderwritingCase = createUnderwritingCase;
exports.getUnderwritingCase = getUnderwritingCase;
exports.listUnderwritingCases = listUnderwritingCases;
exports.saveAnchorRecord = saveAnchorRecord;
exports.saveAnchorBatch = saveAnchorBatch;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/* -------------------------------------------------------
 * BORROWER
 * -----------------------------------------------------*/
async function createBorrower(data) {
    return prisma.borrower.create({ data });
}
async function getBorrowerById(id) {
    return prisma.borrower.findUnique({
        where: { id: Number(id) }
    });
}
/* -------------------------------------------------------
 * APPLICATION (Your original underwriting system)
 * -----------------------------------------------------*/
async function createApplication(data) {
    return prisma.application.create({ data });
}
async function updateApplication(id, data) {
    return prisma.application.update({
        where: { id: String(id) },
        data
    });
}
async function getApplicationWithBorrower(id) {
    return prisma.application.findUnique({
        where: { id: String(id) },
        include: {
            borrower: true,
            underwriting: true,
            documents: true
        }
    });
}
async function listApplications() {
    return prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            borrower: true,
            underwriting: true
        }
    });
}
async function attachDocument(appId, data) {
    return prisma.document.create({
        data: {
            ...data,
            applicationId: appId
        }
    });
}
async function saveRiskScore(appId, score, signals) {
    return prisma.underwriting.update({
        where: { applicationId: appId },
        data: {
            riskScore: score,
            fraudSignals: signals
        }
    });
}
async function saveDecision(appId, decision, pricing) {
    return prisma.underwriting.update({
        where: { applicationId: appId },
        data: {
            decision,
            pricingModel: pricing,
            decidedAt: new Date()
        }
    });
}
async function getFullUnderwritingFile(appId) {
    return prisma.underwriting.findUnique({
        where: { applicationId: appId },
        include: {
            application: {
                include: {
                    borrower: true,
                    documents: true
                }
            }
        }
    });
}
/* -------------------------------------------------------
 * MORTGAGE UNDERWRITING (Option A)
 * -----------------------------------------------------*/
async function createMortgage(data) {
    return prisma.mortgage.create({ data });
}
async function getMortgageById(id) {
    return prisma.mortgage.findUnique({
        where: { id: Number(id) },
        include: {
            borrower: true,
            property: true
        }
    });
}
/* -------------------------------------------------------
 * UNDERWRITING CASE (Mortgage Underwriting)
 * -----------------------------------------------------*/
async function createUnderwritingCase(data) {
    return prisma.underwritingCase.create({ data });
}
async function getUnderwritingCase(id) {
    return prisma.underwritingCase.findUnique({
        where: { id: Number(id) },
        include: {
            borrower: true,
            mortgage: {
                include: {
                    property: true
                }
            }
        }
    });
}
async function listUnderwritingCases() {
    return prisma.underwritingCase.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            borrower: true,
            mortgage: true
        }
    });
}
/* -------------------------------------------------------
 * ANCHORING (AnchorRecord + AnchorBatch)
 * -----------------------------------------------------*/
async function saveAnchorRecord(data) {
    return prisma.anchorRecord.create({ data });
}
async function saveAnchorBatch(data) {
    return prisma.anchorBatch.create({
        data,
        include: { anchors: true }
    });
}
