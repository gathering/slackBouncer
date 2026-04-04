import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { prisma } from "$lib/server/db/client";

export const load: PageServerLoad = async ({ params }) => {
  const channel = await prisma.slackChannel.findUnique({
    where: { id: params.id },
    include: {
      settings: {
        include: {
          allowedUsers: {
            include: { user: true },
          },
        },
      },
    },
  });

  if (!channel) throw error(404, "Channel not found");

  const [allUsers, globalUsers] = await Promise.all([
    prisma.slackUser.findMany({
      where: { isBot: false, isDeleted: false },
      orderBy: { displayName: "asc" },
    }),
    prisma.globalAllowedUser.findMany({
      include: { user: true },
    }),
  ]);

  return {
    channel: {
      id: channel.id,
      name: channel.name,
      isGeneral: channel.isGeneral,
      isPrivate: channel.isPrivate,
      isEnabled: channel.settings?.isEnabled ?? false,
      allowAllUsers: channel.settings?.allowAllUsers ?? false,
      allowedUserIds: channel.settings?.allowedUsers.map((u) => u.userId) ?? [],
    },
    allUsers: allUsers.map((u) => ({
      id: u.id,
      displayName: u.displayName || u.name,
      email: u.email,
    })),
    globalUserIds: globalUsers.map((g) => g.userId),
  };
};
