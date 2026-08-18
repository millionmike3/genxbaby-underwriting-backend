import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";
import { logAudit } from "@/services/audit/log";
import { pushNotification } from "@/services/notifications/notify.service";
import { anchorMerkleRoot } from "@/services/anchor/anchor.service";
import { generateMerkleRoot } from "@/services/merkle/merkle.service";

export async function POST(req: NextRequest, { params }: any) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId!, "ANCHOR_UNDERWRITING");

    const applicationId = params.id;

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { underwriting: true }
    });

    if (!app || !app.underwriting) {
      return NextResponse.json(
        { error: "Underwriting not found" },
        { status: 404 }
      );
    }

    const merkleRoot = generateMerkleRoot(app.underwriting);

    const anchor = await anchorMerkleRoot(merkleRoot);

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        merkleRoot,
        polygonTxHash: anchor.txHash,
        anchoredAt: anchor.anchoredAt
      }
    });

    await pushNotification("ANCHOR", `Application ${applicationId} anchored`);

    await logAudit({
      actor: userId!,
      action: "ANCHOR_UNDERWRITING",
      target: applicationId,
      metadata: { merkleRoot, txHash: anchor.txHash }
    });

    return NextResponse.json({ success: true, anchor });
  } catch (err) {
    console.error("Anchor error:", err);
    return NextResponse.json({ error: "Anchor failed" }, { status: 500 });
  }
}
