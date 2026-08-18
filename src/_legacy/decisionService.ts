// src/services/decisionService.ts
import { prisma } from "../db";

export async function saveDecision(
  applicationId: string,
  status: "APPROVED" | "DECLINED" | "NEEDS_MORE_INFO",
  notes: string
) {
  // Simple mapping: status → tier/rate (could be more complex)
  let tier = "A";
  let rate = 6.5;

  if (status === "DECLINED") {
    tier = "DECLINED";
    rate = 0;
  }

  if (status === "NEEDS_MORE_INFO") {
    tier = "PENDING";
    rate = 0;
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      decisionStatus: status,
      decisionTier: tier,
      decisionRate: rate,
      decisionNotes: notes,
    },
  });
}
