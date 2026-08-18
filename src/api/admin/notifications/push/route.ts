import { NextRequest, NextResponse } from "next/server";
import { pushNotification } from "@/services/notifications/notify.service";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";

/**
 * POST /api/admin/notifications/push
 *
 * Body:
 * {
 *   "type": "APPROVE",
 *   "message": "Application A1001 approved"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    // Only admins or auditors can push notifications
    await requirePermission(userId!, "VIEW_AUDIT_LOGS");

    const body = await req.json();
    const { type, message } = body;

    if (!type || !message) {
      return NextResponse.json(
        { error: "Missing required fields: type, message" },
        { status: 400 }
      );
    }

    // Push notification
    await pushNotification(type, message);

    // Audit log
    await logAudit({
      actor: userId!,
      action: "PUSH_NOTIFICATION",
      target: type,
      metadata: { message }
    });

    return NextResponse.json({
      success: true,
      message: "Notification pushed successfully"
    });
  } catch (err) {
    console.error("Push notification error:", err);
    return NextResponse.json(
      { error: "Failed to push notification" },
      { status: 500 }
    );
  }
}
