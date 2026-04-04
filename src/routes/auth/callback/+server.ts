import { redirect, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import {
  handleCallback,
  upsertAdminFromKeycloak,
} from "$lib/server/auth/keycloak";
import { createSession } from "$lib/server/auth/session";
import { env } from "$env/dynamic/private";

export const GET: RequestHandler = async (event) => {
  const { url, cookies } = event;

  const state = cookies.get("oauth_state");
  const codeVerifier = cookies.get("code_verifier");
  const next = cookies.get("oauth_next") ?? "/admin";

  if (!state || !codeVerifier) {
    throw error(400, "Invalid OAuth state");
  }

  cookies.delete("oauth_state", { path: "/" });
  cookies.delete("code_verifier", { path: "/" });
  cookies.delete("oauth_next", { path: "/" });

  let claims: {
    sub: string;
    email?: string;
    name?: string;
    groups: string[];
    idToken?: string;
  };
  try {
    claims = await handleCallback(url, state, codeVerifier);
  } catch (e) {
    console.error("OAuth callback error:", e);
    throw error(401, "Authentication failed");
  }

  if (!claims.email) {
    throw error(401, "No email in token");
  }

  if (!claims.groups.includes(env.KEYCLOAK_REQUIRED_GROUP ?? "slackbouncer")) {
    throw redirect(303, "/?error=unauthorized");
  }

  const name = claims.name ?? claims.email;
  const admin = await upsertAdminFromKeycloak(claims.email, name);

  createSession(event, {
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name,
    idToken: claims.idToken,
  });

  throw redirect(303, next);
};
