import { prisma } from "$lib/server/db/client";
import { getUsers, getChannels } from "$lib/server/slack/client";

export async function syncSlackUsers(): Promise<{ synced: number; active: number }> {
  const users = await getUsers();
  let synced = 0;
  let active = 0;

  for (const u of users) {
    if (u.is_bot || u.id === "USLACKBOT") continue;
    await prisma.slackUser.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        realName: u.real_name ?? u.name,
        displayName: u.profile?.display_name ?? u.name,
        email: u.profile?.email ?? null,
        isBot: u.is_bot ?? false,
        isDeleted: u.deleted ?? false,
        isRestricted: u.is_restricted ?? false,
        isUltraRestricted: u.is_ultra_restricted ?? false,
        syncedAt: new Date(),
      },
      create: {
        id: u.id,
        name: u.name,
        realName: u.real_name ?? u.name,
        displayName: u.profile?.display_name ?? u.name,
        email: u.profile?.email ?? null,
        isBot: u.is_bot ?? false,
        isDeleted: u.deleted ?? false,
        isRestricted: u.is_restricted ?? false,
        isUltraRestricted: u.is_ultra_restricted ?? false,
      },
    });
    synced++;
    if (!u.deleted) active++;
  }

  return { synced, active };
}

export async function syncSlackChannels(): Promise<{ synced: number }> {
  const channels = await getChannels();
  let synced = 0;

  for (const ch of channels) {
    await prisma.slackChannel.upsert({
      where: { id: ch.id },
      update: {
        name: ch.name,
        isGeneral: ch.is_general ?? false,
        isPrivate: ch.is_private ?? false,
        isArchived: ch.is_archived ?? false,
        syncedAt: new Date(),
      },
      create: {
        id: ch.id,
        name: ch.name,
        isGeneral: ch.is_general ?? false,
        isPrivate: ch.is_private ?? false,
        isArchived: ch.is_archived ?? false,
      },
    });
    synced++;
  }

  return { synced };
}
