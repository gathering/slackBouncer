import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const [total, byUser, byChannel] = await Promise.all([
    prisma.usageEvent.count(),
    prisma.usageEvent.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    prisma.usageEvent.groupBy({
      by: ["channelId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
  ]);

  // Enrich with names
  const userIds = byUser.map((u) => u.userId);
  const channelIds = byChannel.map((c) => c.channelId);

  const [users, channels] = await Promise.all([
    prisma.slackUser.findMany({ where: { id: { in: userIds } } }),
    prisma.slackChannel.findMany({ where: { id: { in: channelIds } } }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const channelMap = new Map(channels.map((c) => [c.id, c]));

  return json({
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
  });
};
