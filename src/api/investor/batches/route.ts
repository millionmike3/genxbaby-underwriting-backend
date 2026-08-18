import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: NextRequest) {
  try {
    // Fetch all anchored batches
    const batches = await prisma.anchorBatch.findMany({
      orderBy: { anchoredAt: "desc" },
      include: {
        anchors: true
      }
    });

    // Calculate investor metrics
    const totalBatches = batches.length;

    const allAnchors = batches.flatMap((b) => b.anchors);

    const totalApplications = allAnchors.length;

    const avgRiskScore =
      allAnchors.reduce((sum, a) => sum + (a.riskScore || 0), 0) /
      (allAnchors.length || 1);

    return NextResponse.json({
      metrics: {
        totalBatches,
        avgRiskScore,
        totalApplications
      },
      batches: batches.map((batch) => ({
        id: batch.id,
        applicationIds: batch.anchors.map((a) => a.applicationId),
        merkleRoot: batch.merkleRoot,
        txHash: batch.txHash,
        blockNumber: batch.blockNumber,
        anchoredAt: batch.anchoredAt
      }))
    });
  } catch (err) {
    console.error("Investor batch fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load investor batches" },
      { status: 500 }
    );
  }
}
