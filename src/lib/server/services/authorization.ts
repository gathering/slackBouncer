import { prisma } from "$lib/server/db/client";
import { isUserInChannel } from "$lib/server/slack/client";

export async function canUserTellAll(
  userId: string,
  channelId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  // 1. Check channel settings exist and are enabled
  const settings = await prisma.channelSettings.findUnique({
    where: { channelId },
    include: {
      allowedUsers: true,
    },
  });

  if (!settings || !settings.isEnabled) {
    return { allowed: false, reason: "Channel not enabled" };
  }

  // 2. Check membership in channel via Slack API (no caching)
  const inChannel = await isUserInChannel(userId, channelId);
  if (!inChannel) {
    return { allowed: false, reason: "User not in channel" };
  }

  // 3. If allow-all is enabled, any channel member may use the command
  if (settings.allowAllUsers) {
    return { allowed: true };
  }

  // 4. Check global allowlist
  const globalEntry = await prisma.globalAllowedUser.findUnique({
    where: { userId },
  });
  if (globalEntry) {
    return { allowed: true };
  }

  // 5. Check channel allowlist
  const channelEntry = settings.allowedUsers.find((u) => u.userId === userId);
  if (channelEntry) {
    return { allowed: true };
  }

  return { allowed: false, reason: "User not in allowlist" };
}
