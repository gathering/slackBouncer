import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db/client";

export const load: PageServerLoad = async () => {
  const channels = await prisma.slackChannel.findMany({
    where: { isArchived: false },
    include: { settings: true },
    orderBy: { name: "asc" },
  });

  return {
    channels: channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      isGeneral: ch.isGeneral,
      isPrivate: ch.isPrivate,
      isEnabled: ch.settings?.isEnabled ?? false,
    })),
  };
};
