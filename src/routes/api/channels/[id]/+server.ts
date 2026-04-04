import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";
import { z } from "zod";
import { logAudit } from "$lib/server/services/audit";

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const channel = await prisma.slackChannel.findUnique({
    where: { id: params.id },
    include: { settings: true },
  });

  if (!channel) throw error(404, "Channel not found");

  return json({
    id: channel.id,
    name: channel.name,
    isGeneral: channel.isGeneral,
    isPrivate: channel.isPrivate,
    isEnabled: channel.settings?.isEnabled ?? false,
    syncedAt: channel.syncedAt,
  });
};
