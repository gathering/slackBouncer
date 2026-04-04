import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db/client";

export const load: PageServerLoad = async () => {
  const logs = await prisma.adminAuditLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { admin: { select: { name: true, email: true } } },
  });

  return {
    logs: logs.map((l) => ({
      id: l.id,
      adminName: l.admin.name,
      action: l.action,
      entity: l.entity,
      details: l.details,
      createdAt: l.createdAt.toISOString(),
    })),
  };
};
