import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";
import { z } from "zod";
import { logAudit } from "$lib/server/services/audit";

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const settings = await prisma.channelSettings.findUnique({
    where: { channelId: params.id },
    include: {
      allowedUsers: {
        include: { user: true },
      },
    },
  });

  const users =
    settings?.allowedUsers.map((au) => ({
      id: au.user.id,
      name: au.user.name,
      displayName: au.user.displayName,
      email: au.user.email,
    })) ?? [];

  return json(users);
};

const schema = z.object({
  userIds: z.array(z.string()),
});

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw error(400, "Invalid request body");

  const { userIds } = parsed.data;

  const channel = await prisma.slackChannel.findUnique({
    where: { id: params.id },
  });
  if (!channel) throw error(404, "Channel not found");

  // Ensure settings row exists
  const settings = await prisma.channelSettings.upsert({
    where: { channelId: params.id },
    update: {},
    create: { channelId: params.id, isEnabled: false },
  });

  // Replace allowed users
  await prisma.channelAllowedUser.deleteMany({
    where: { channelSettingId: settings.id },
  });

  if (userIds.length > 0) {
    await prisma.channelAllowedUser.createMany({
      data: userIds.map((userId) => ({
        channelSettingId: settings.id,
        userId,
      })),
    });
  }

  await logAudit(locals.admin.id, "update_channel_allowlist", "channel", {
    channelId: params.id,
    channelName: channel.name,
    userCount: userIds.length,
  });

  return json({ userIds });
};
