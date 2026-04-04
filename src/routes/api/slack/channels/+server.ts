import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";

export const GET: RequestHandler = async () => {
  const channels = await prisma.slackChannel.findMany({
    where: { isArchived: false },
    include: { settings: true },
    orderBy: { name: "asc" },
  });

  return json(
    channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      isGeneral: ch.isGeneral,
      isPrivate: ch.isPrivate,
      isEnabled: ch.settings?.isEnabled ?? false,
      syncedAt: ch.syncedAt,
    })),
  );
};
