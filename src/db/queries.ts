import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a borrower
export async function createBorrower(data) {
  return prisma.borrower.create({ data });
}

// Get borrower by ID
export async function getBorrowerById(id: string) {
  return prisma.borrower.findUnique({ where: { id } });
}

// Find borrower by last 4 of SSN
export async function findBorrowerBySSNLast4(last4: string) {
  return prisma.borrower.findFirst({ where: { ssnLast4: last4 } });
}

// Create a loan application
export async function createApplication(data) {
  return prisma.application.create({ data });
}

// Update application (status, docs, etc.)
export async function updateApplication(id: string, data) {
  return prisma.application.update({ where: { id }, data });
}

// Get full application with borrower + underwriting
export async function getApplicationWithBorrower(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: { borrower: true, underwriting: true, documents: true }
  });
}

// List all applications (for admin dashboard)
export async function listApplications() {
  return prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { borrower: true, underwriting: true }
  });
}

export async function attachDocument(appId: string, data) {
  return prisma.document.create({
    data: { ...data, applicationId: appId }
  });
}

// Save risk score + signals
export async function saveRiskScore(appId: string, score: number, signals: any) {
  return prisma.underwriting.update({
    where: { applicationId: appId },
    data: {
      riskScore: score,
      fraudSignals: signals
    }
  });
}

// Save final underwriting decision
export async function saveDecision(appId: string, decision: string, pricing: any) {
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
export async function getFullUnderwritingFile(appId: string) {
  return prisma.underwriting.findUnique({
    where: { applicationId: appId },
    include: {
      Application: {
        include: { borrower: true, documents: true }
      }
    }
  });
}
