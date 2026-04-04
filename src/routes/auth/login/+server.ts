import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAuthorizationUrl } from "$lib/server/auth/keycloak";
import * as crypto from "node:crypto";
import * as openidClient from "openid-client";

export const GET: RequestHandler = async ({ url, cookies }) => {
  const next = url.searchParams.get("next") ?? "/admin";
  const prompt = url.searchParams.get("prompt") ?? undefined;
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = openidClient.randomPKCECodeVerifier();

  cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookies.set("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookies.set("oauth_next", next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const authUrl = await getAuthorizationUrl(state, codeVerifier, prompt);
  throw redirect(303, authUrl);
};
