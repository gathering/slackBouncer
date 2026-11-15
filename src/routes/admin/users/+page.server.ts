import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/server/db/client";
import { getKeycloakUsers } from "$lib/server/auth/keycloak";

export const load: PageServerLoad = async () => {
  const [slackUsers, keycloakUsers] = await Promise.all([
    prisma.slackUser.findMany({
      where: { isBot: false, isDeleted: false },
      orderBy: { displayName: "asc" },
    }),
    getKeycloakUsers().catch((err) => {
      console.error("Failed to fetch Keycloak users:", err);
      return null;
    }),
  ]);

  const keycloakEmails = new Set(
    (keycloakUsers ?? []).map((u) => u.email?.toLowerCase()).filter(Boolean),
  );
  const slackEmails = new Set(
    slackUsers.map((u) => u.email?.toLowerCase()).filter(Boolean),
  );

  return {
    slackUsers: slackUsers.map((u) => ({
      id: u.id,
      name: u.displayName || u.name,
      email: u.email,
      isRestricted: u.isRestricted,
      isUltraRestricted: u.isUltraRestricted,
      inKeycloak: u.email ? keycloakEmails.has(u.email.toLowerCase()) : false,
    })),
    keycloakUsers: (keycloakUsers ?? []).map((u) => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username,
      email: u.email,
      enabled: u.enabled,
      inSlack: u.email ? slackEmails.has(u.email.toLowerCase()) : false,
    })),
    keycloakError: keycloakUsers === null,
  };
};
