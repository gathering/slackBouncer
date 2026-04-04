import { prisma } from "$lib/server/db/client";
import type { Prisma } from "@prisma/client";

export async function logAudit(
  adminId: string,
  action: string,
  entity: string,
  details?: Record<string, unknown>,
): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      entity,
      details: details as Prisma.InputJsonValue | undefined,
    },
  });
}
