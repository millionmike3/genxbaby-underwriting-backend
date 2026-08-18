import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { analyzeBehavior } from "@/services/behavior/behavior.service";
import { sanitizeProperty } from "@/services/property/property.service";
import { sanitizeStock } from "@/services/stock/stock.service";
import { runUnderwritingEngine } from "@/services/underwriting/engine";
import { generateMerkleRoot } from "@/services/merkle/merkle.service";
import { anchorMerkleRoot } from "@/services/anchor/anchor.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;

    // 1. Load application from DB
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        property: true,
        stockSnapshot: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // 2. Run Behavior Module
    const behavior = await analyzeBehavior({
      applicationId,
      borrowerId: application.borrowerId,
      ipAddress: application.ipAddress,
      deviceId: application.deviceId,
      submittedAt: application.submittedAt,
      priorApplicationsCount: application.priorApplicationsCount,
      rejectedApplicationsCount: application.rejectedApplicationsCount,
      documentCount: application.documentCount,
      avgDocumentUploadDelayMinutes: application.avgDocDelayMinutes
    });

    // 3. Run Property Sanitizer
    const property = await sanitizeProperty({
      applicationId,
      address: application.property.address,
      city: application.property.city,
      state: application.property.state,
      postalCode: application.property.postalCode,
      country: application.property.country,
      propertyType: application.property.propertyType,
      estimatedValue: application.property.estimatedValue,
      loanAmount: application.property.loanAmount,
      units: application.property.units,
      yearBuilt: application.property.yearBuilt
    });

    // 4. Run Stock Sanitizer
    const stock = await sanitizeStock({
      applicationId,
      asOf: new Date(),
      vixLevel: application.stockSnapshot.vixLevel,
      mortgageSpreadBps: application.stockSnapshot.mortgageSpreadBps,
      riskOnSentiment: application.stockSnapshot.riskOnSentiment,
      liquidityIndex: application.stockSnapshot.liquidityIndex
    });

    // 5. Run Underwriting Engine
    const underwriting = await runUnderwritingEngine({
      application,
      behavior,
      property,
      stock
    });

    // 6. Generate Merkle Root
    const merkleRoot = generateMerkleRoot(underwriting.payload);

    // 7. Fetch anchor record (if exists)
    const anchorRecord = await prisma.anchorRecord.findFirst({
      where: { applicationId },
      orderBy: { anchoredAt: "desc" }
    });

    return NextResponse.json({
      applicationId,
      behavior,
      property,
      stock,
      decision: underwriting.decision,
      riskScore: underwriting.riskScore,
      payload: underwriting.payload,
      merkleRoot,
      anchor: anchorRecord || null
    });
  } catch (err: any) {
    console.error("Underwriting fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch underwriting result" },
      { status: 500 }
    );
  }
}
