import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") ?? "50", 10),
    100,
  );
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { name: true, email: true } },
      },
    }),
    prisma.adminAuditLog.count(),
  ]);

  return json({
    logs: logs.map((l) => ({
      id: l.id,
      adminId: l.adminId,
      adminName: l.admin.name,
      adminEmail: l.admin.email,
      action: l.action,
      entity: l.entity,
      details: l.details,
      createdAt: l.createdAt,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};
