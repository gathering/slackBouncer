import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db/client";

export const load: PageServerLoad = async () => {
  const [total, byUser, byChannel] = await Promise.all([
    prisma.usageEvent.count(),
    prisma.usageEvent.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.usageEvent.groupBy({
      by: ["channelId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const userIds = byUser.map((u) => u.userId);
  const channelIds = byChannel.map((c) => c.channelId);

  const [users, channels] = await Promise.all([
    prisma.slackUser.findMany({ where: { id: { in: userIds } } }),
    prisma.slackChannel.findMany({ where: { id: { in: channelIds } } }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const channelMap = new Map(channels.map((c) => [c.id, c]));

  return {
    total,
    byUser: byUser.map((u) => ({
      userId: u.userId,
      displayName: userMap.get(u.userId)?.displayName ?? u.userId,
      count: u._count.id,
    })),
    byChannel: byChannel.map((c) => ({
      channelId: c.channelId,
      name: channelMap.get(c.channelId)?.name ?? c.channelId,
      count: c._count.id,
    })),
  };
};
