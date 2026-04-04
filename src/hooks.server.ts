import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { readSession } from "$lib/server/auth/session";
import { prisma } from "$lib/server/db/client";

export const handle: Handle = async ({ event, resolve }) => {
  const session = readSession(event);
  if (session) {
    const admin = await prisma.admin.findFirst({
      where: { id: session.adminId, isActive: true },
    });
      if (admin) {
        event.locals.admin = {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
    }
  }

  const path = event.url.pathname;
  const isAdminRoute = path.startsWith("/admin") || path.startsWith("/api/");

  if (isAdminRoute && !event.locals.admin) {
    throw redirect(303, "/");
  }

  return resolve(event);
};
