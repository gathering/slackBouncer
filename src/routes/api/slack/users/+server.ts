import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";

export const GET: RequestHandler = async () => {
  const users = await prisma.slackUser.findMany({
    where: { isBot: false, isDeleted: false },
    orderBy: { displayName: "asc" },
  });

  return json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      realName: u.realName,
      displayName: u.displayName,
      email: u.email,
      syncedAt: u.syncedAt,
    })),
  );
};
