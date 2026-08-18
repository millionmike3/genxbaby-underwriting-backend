import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  await requirePermission(userId!, "VIEW_AUDIT_LOGS");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000
  });

  await pushNotification("AUDIT_EXPORT", "Audit logs exported (JSON)");
  await logAudit({
    actor: userId!,
    action: "EXPORT_AUDIT_LOGS_JSON",
    target: "audit-log-json",
    metadata: { count: logs.length }
  });

  return NextResponse.json(logs);
}
