import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  await requirePermission(userId!, "VIEW_AUDIT_LOGS");

  const users = await prisma.user.findMany({
    include: {
      UserRole: {
        include: { Role: true }
      }
    }
  });

  return NextResponse.json({ users });
}
