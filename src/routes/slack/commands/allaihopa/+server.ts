import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  verifySlackSignature,
  getSigningSecret,
} from "$lib/server/slack/verify";
import { canUserTellAll } from "$lib/server/services/authorization";
import { prisma } from "$lib/server/db/client";

export const POST: RequestHandler = async ({ request }) => {
  const rawBody = await request.text();

  const signature = request.headers.get("x-slack-signature") ?? "";
  const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";

  if (
    !verifySlackSignature(getSigningSecret(), signature, timestamp, rawBody)
  ) {
    throw error(401, "Invalid signature");
  }

  const params = new URLSearchParams(rawBody);
  const userId = params.get("user_id") ?? "";
  const channelId = params.get("channel_id") ?? "";
  const text = (params.get("text") ?? "").trim();

  if (!userId || !channelId) {
    throw error(400, "Missing required parameters");
  }

  const { allowed } = await canUserTellAll(userId, channelId);
  if (!allowed) {
    return json({
      response_type: "ephemeral",
      text: "You are not allowed to use this command in this channel",
    });
  }

  const channel = await prisma.slackChannel.findUnique({
    where: { id: channelId },
  });
  const mention = channel?.isGeneral ? "<!everyone>" : "<!channel>";

  const message = `${mention} from <@${userId}>:\nSe over!`;

  try {
    await prisma.usageEvent.create({
      data: { userId, channelId, hadText: text.length > 0 },
    });
  } catch {
    // user not yet synced, skip usage tracking
  }

  return json({
    response_type: "in_channel",
    text: message,
  });
};
