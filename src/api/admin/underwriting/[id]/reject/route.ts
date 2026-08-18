import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";

export async function POST(req: NextRequest, { params }: any) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId!, "REJECT_APPLICATION");

    const applicationId = params.id;

    await prisma.application.update({
      where: { id: applicationId },
      data: { decisionStatus: "REJECTED" }
    });

    await pushNotification("REJECT", `Application ${applicationId} rejected`);

    await logAudit({
      actor: userId!,
      action: "REJECT_APPLICATION",
      target: applicationId,
      metadata: {}
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reject error:", err);
    return NextResponse.json({ error: "Reject failed" }, { status: 500 });
  }
}
