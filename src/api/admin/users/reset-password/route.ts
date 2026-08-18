import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  await requirePermission(userId!, "VIEW_AUDIT_LOGS");

  const { targetUserId, newPassword } = await req.json();

  await prisma.user.update({
    where: { id: targetUserId },
    data: { password: newPassword }
  });

  await pushNotification("USER_UPDATE", `Password reset for ${targetUserId}`);
  await logAudit({
    actor: userId!,
    action: "RESET_PASSWORD",
    target: targetUserId,
    metadata: {}
  });

  return NextResponse.json({ success: true });
}
