import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { destroySession, readSession } from "$lib/server/auth/session";
import { getLogoutUrl } from "$lib/server/auth/keycloak";

export const POST: RequestHandler = async (event) => {
  const session = readSession(event);
  destroySession(event);
  // Redirect to Keycloak end_session with id_token_hint to skip confirmation
  const logoutUrl = await getLogoutUrl(
    `${event.url.origin}/`,
    session?.idToken,
  );
  throw redirect(303, logoutUrl);
};
