import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";
import { batchAnchorApplications } from "@/services/anchor/batchAnchor.service";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId!, "BATCH_ANCHOR");

    const body = await req.json();
    const applicationIds = body.applicationIds;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: "applicationIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const result = await batchAnchorApplications(applicationIds);

    await pushNotification(
      "BATCH_ANCHOR",
      `Batch ${result.batch.id} anchored (${applicationIds.length} apps)`
    );

    await logAudit({
      actor: userId!,
      action: "BATCH_ANCHOR",
      target: result.batch.id,
      metadata: {
        applicationIds,
        batchMerkleRoot: result.batch.merkleRoot,
        txHash: result.batch.txHash
      }
    });

    return NextResponse.json({
      success: true,
      batch: result.batch,
      anchorRecords: result.anchorRecords
    });
  } catch (err) {
    console.error("Batch anchor error:", err);
    return NextResponse.json(
      { error: "Batch anchor failed" },
      { status: 500 }
    );
  }
}
