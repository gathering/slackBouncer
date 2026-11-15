import type { Handle, RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { readSession } from "$lib/server/auth/session";
import { prisma } from "$lib/server/db/client";

// Slack posts its slash commands as a form with no Origin header. The
// request is authenticated by its signature (slack/verify.ts), not by origin.
const SLACK_COMMAND_PATH = "/slack/commands/allaihopa";

const FORM_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
];

// What SvelteKit's own check (csrf.checkOrigin) does, for every route but
// Slack's: a form post from another origin is refused.
function isCrossSiteFormPost(event: RequestEvent): boolean {
  const { request, url } = event;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    return false;
  }
  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!FORM_TYPES.some((t) => type.startsWith(t))) return false;
  return request.headers.get("origin") !== url.origin;
}

export const handle: Handle = async ({ event, resolve }) => {
  if (
    event.url.pathname !== SLACK_COMMAND_PATH &&
    isCrossSiteFormPost(event)
  ) {
    return new Response(
      `Cross-site ${event.request.method} form submissions are forbidden`,
      { status: 403 },
    );
  }

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
