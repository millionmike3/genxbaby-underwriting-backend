import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { requirePermission } from "@/middleware/rbac";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId!, "VIEW_AUDIT_LOGS");

    const { searchParams } = new URL(req.url);

    const actor = searchParams.get("actor") || undefined;
    const action = searchParams.get("action") || undefined;
    const target = searchParams.get("target") || undefined;
    const q = searchParams.get("q") || undefined;
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    // ⭐ Pagination
    const page = Number(searchParams.get("page") || 1);
    const pageSize = 50;

    const where: any = {};

    // ⭐ Direct filters
    if (actor) where.actor = actor;
    if (action) where.action = action;
    if (target) where.target = target;

    // ⭐ Date range
    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lte = new Date(end);
    }

    // ⭐ Search query
    if (q) {
      where.OR = [
        { actor: { contains: q, mode: "insensitive" } },
        { action: { contains: q, mode: "insensitive" } },
        { target: { contains: q, mode: "insensitive" } }
      ];
    }

    // ⭐ Paginated logs
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // ⭐ Total count for pagination
    const total = await prisma.auditLog.count({ where });

    return NextResponse.json({
      logs,
      total,
      page,
      pageSize
    });
  } catch (err) {
    console.error("Audit list error:", err);
    return NextResponse.json(
      { error: "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
