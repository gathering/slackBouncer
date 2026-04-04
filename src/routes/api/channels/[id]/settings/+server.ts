import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";
import { z } from "zod";
import { logAudit } from "$lib/server/services/audit";
import { joinChannel } from "$lib/server/slack/client";

const schema = z.object({
  isEnabled: z.boolean().optional(),
  allowAllUsers: z.boolean().optional(),
});

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw error(400, "Invalid request body");

  const { isEnabled, allowAllUsers } = parsed.data;

  // Verify channel exists
  const channel = await prisma.slackChannel.findUnique({
    where: { id: params.id },
  });
  if (!channel) throw error(404, "Channel not found");

  const updateData: { isEnabled?: boolean; allowAllUsers?: boolean } = {};
  if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
  if (allowAllUsers !== undefined) updateData.allowAllUsers = allowAllUsers;

  const settings = await prisma.channelSettings.upsert({
    where: { channelId: params.id },
    update: updateData,
    create: {
      channelId: params.id,
      isEnabled: isEnabled ?? false,
      allowAllUsers: allowAllUsers ?? false,
    },
  });

  if (isEnabled) {
    try {
      await joinChannel(params.id);
    } catch {
      // already a member or private channel — ignore
    }
  }

  if (isEnabled !== undefined) {
    await logAudit(
      locals.admin.id,
      isEnabled ? "enable_channel" : "disable_channel",
      "channel",
      {
        channelId: params.id,
        channelName: channel.name,
      },
    );
  }
  if (allowAllUsers !== undefined) {
    await logAudit(
      locals.admin.id,
      allowAllUsers ? "enable_allow_all_users" : "disable_allow_all_users",
      "channel",
      { channelId: params.id, channelName: channel.name },
    );
  }

  return json({
    isEnabled: settings.isEnabled,
    allowAllUsers: settings.allowAllUsers,
  });
};
