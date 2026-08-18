import { prisma } from "@/db/prisma";

export async function logAudit({
  actor,
  action,
  target,
  metadata
}: {
  actor: string;
  action: string;
  target?: string;
  metadata?: any;
}) {
  await prisma.auditLog.create({
    data: {
      actor,
      action,
      target,
      metadata
    }
  });
}
