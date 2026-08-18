import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  await requirePermission(userId!, "VIEW_AUDIT_LOGS");

  const { targetUserId, roleId } = await req.json();

  await prisma.userRole.deleteMany({
    where: { userId: targetUserId }
  });

  await prisma.userRole.create({
    data: {
      userId: targetUserId,
      roleId
    }
  });

  await pushNotification("USER_UPDATE", `User ${targetUserId} role updated`);
  await logAudit({
    actor: userId!,
    action: "UPDATE_USER_ROLE",
    target: targetUserId,
    metadata: { roleId }
  });

  return NextResponse.json({ success: true });
}
