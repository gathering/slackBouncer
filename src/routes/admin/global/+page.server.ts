import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db/client";

export const load: PageServerLoad = async () => {
  const [allUsers, globalEntries] = await Promise.all([
    prisma.slackUser.findMany({
      where: { isBot: false, isDeleted: false },
      orderBy: { displayName: "asc" },
    }),
    prisma.globalAllowedUser.findMany(),
  ]);

  return {
    allUsers: allUsers.map((u) => ({
      id: u.id,
      displayName: u.displayName || u.name,
      email: u.email,
      isRestricted: u.isRestricted,
      isUltraRestricted: u.isUltraRestricted,
    })),
    globalUserIds: globalEntries.map((g) => g.userId),
  };
};
