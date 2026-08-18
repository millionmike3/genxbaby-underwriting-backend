import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId!, "VIEW_AUDIT_LOGS");

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000
    });

    const header = [
      "id",
      "actor",
      "action",
      "target",
      "metadata",
      "createdAt"
    ].join(",");

    const rows = logs.map((log) =>
      [
        log.id,
        log.actor,
        log.action,
        log.target ?? "",
        JSON.stringify(log.metadata ?? {}),
        log.createdAt.toISOString()
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [header, ...rows].join("\n");

    await pushNotification(
      "AUDIT_EXPORT",
      `Audit logs exported (${logs.length} rows)`
    );

    await logAudit({
      actor: userId!,
      action: "EXPORT_AUDIT_LOGS",
      target: "audit-log-csv",
      metadata: { rowCount: logs.length }
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit_logs_${Date.now()}.csv"`
      }
    });
  } catch (err) {
    console.error("Audit export error:", err);
    return NextResponse.json(
      { error: "Failed to export audit logs" },
      { status: 500 }
    );
  }
}
