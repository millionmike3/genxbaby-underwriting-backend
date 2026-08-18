import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET() {
  try {
    // Risk score distribution
    const riskScores = await prisma.anchorRecord.groupBy({
      by: ["riskScore"],
      _count: { riskScore: true }
    });

    // Anchored volume over time
    const batches = await prisma.anchorBatch.findMany({
      orderBy: { anchoredAt: "asc" },
      select: {
        anchoredAt: true,
        anchors: true
      }
    });

    const batchTimeline = batches.map((b) => ({
      date: b.anchoredAt.toISOString().split("T")[0],
      count: b.anchors.length
    }));

    // Investor exposure (total anchored principal)
    const exposure = await prisma.anchorRecord.findMany({
      include: {
        application: true
      }
    });

    const exposureTimeline = exposure.map((r) => ({
      date: r.anchoredAt.toISOString().split("T")[0],
      amount: r.application.amount
    }));

    return NextResponse.json({
      riskScores,
      batchTimeline,
      exposureTimeline
    });
  } catch (err) {
    console.error("Chart data error:", err);
    return NextResponse.json(
      { error: "Failed to load chart data" },
      { status: 500 }
    );
  }
}
