import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  await requirePermission(userId!, "VIEW_AUDIT_LOGS");

  const roles = await prisma.role.findMany();
  return NextResponse.json({ roles });
}
