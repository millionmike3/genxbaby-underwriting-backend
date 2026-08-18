"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBorrower = createBorrower;
exports.getBorrowerById = getBorrowerById;
exports.findBorrowerBySSNLast4 = findBorrowerBySSNLast4;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.getApplicationWithBorrower = getApplicationWithBorrower;
exports.listApplications = listApplications;
exports.attachDocument = attachDocument;
exports.saveRiskScore = saveRiskScore;
exports.saveDecision = saveDecision;
exports.getFullUnderwritingFile = getFullUnderwritingFile;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a borrower
async function createBorrower(data) {
    return prisma.borrower.create({ data });
}
// Get borrower by ID
async function getBorrowerById(id) {
    return prisma.borrower.findUnique({ where: { id } });
}
// Find borrower by last 4 of SSN
async function findBorrowerBySSNLast4(last4) {
    return prisma.borrower.findFirst({ where: { ssnLast4: last4 } });
}
// Create a loan application
async function createApplication(data) {
    return prisma.application.create({ data });
}
// Update application (status, docs, etc.)
async function updateApplication(id, data) {
    return prisma.application.update({ where: { id }, data });
}
// Get full application with borrower + underwriting
async function getApplicationWithBorrower(id) {
    return prisma.application.findUnique({
        where: { id },
        include: { borrower: true, underwriting: true, documents: true }
    });
}
// List all applications (for admin dashboard)
async function listApplications() {
    return prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        include: { borrower: true, underwriting: true }
    });
}
async function attachDocument(appId, data) {
    return prisma.document.create({
        data: { ...data, applicationId: appId }
    });
}
// Save risk score + signals
async function saveRiskScore(appId, score, signals) {
    return prisma.underwriting.update({
        where: { applicationId: appId },
        data: {
            riskScore: score,
            fraudSignals: signals
        }
    });
}
// Save final underwriting decision
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
// Get full underwriting file
async function getFullUnderwritingFile(appId) {
    return prisma.underwriting.findUnique({
        where: { applicationId: appId },
        include: {
            Application: {
                include: { borrower: true, documents: true }
            }
        }
    });
}
