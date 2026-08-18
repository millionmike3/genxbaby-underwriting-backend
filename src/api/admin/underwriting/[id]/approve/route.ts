import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";

export async function POST(req: NextRequest, { params }: any) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId!, "APPROVE_APPLICATION");

    const applicationId = params.id;

    await prisma.application.update({
      where: { id: applicationId },
      data: { decisionStatus: "APPROVED" }
    });

    await pushNotification("APPROVE", `Application ${applicationId} approved`);

    await logAudit({
      actor: userId!,
      action: "APPROVE_APPLICATION",
      target: applicationId,
      metadata: {}
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Approve error:", err);
    return NextResponse.json({ error: "Approve failed" }, { status: 500 });
  }
}
