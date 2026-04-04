import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";
import { z } from "zod";
import { logAudit } from "$lib/server/services/audit";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const entries = await prisma.globalAllowedUser.findMany({
    include: { user: true },
    orderBy: { user: { displayName: "asc" } },
  });

  return json(
    entries.map((e) => ({
      id: e.user.id,
      name: e.user.name,
      displayName: e.user.displayName,
      email: e.user.email,
    })),
  );
};

const schema = z.object({
  userIds: z.array(z.string()),
});

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw error(400, "Invalid request body");

  const { userIds } = parsed.data;

  // Replace global allowed users
  await prisma.globalAllowedUser.deleteMany();

  if (userIds.length > 0) {
    await prisma.globalAllowedUser.createMany({
      data: userIds.map((userId) => ({ userId })),
    });
  }

  await logAudit(locals.admin.id, "update_global_allowlist", "global", {
    userCount: userIds.length,
  });

  return json({ userIds });
};
