import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") ?? "50", 10),
    100,
  );
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.usageEvent.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { displayName: true, name: true } },
        channel: { select: { name: true } },
      },
    }),
    prisma.usageEvent.count(),
  ]);

  return json({
    events: events.map((e) => ({
      id: e.id,
      userId: e.userId,
      userName: e.user.displayName || e.user.name,
      channelId: e.channelId,
      channelName: e.channel.name,
      hadText: e.hadText,
      createdAt: e.createdAt,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};
