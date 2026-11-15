import * as openidClient from "openid-client";
import { env } from "$env/dynamic/private";
import { prisma } from "$lib/server/db/client";

let _config: openidClient.Configuration | null = null;

export async function getOidcConfig(): Promise<openidClient.Configuration> {
  if (!_config) {
    // Allow HTTP for local dev (openid-client v6 requires HTTPS by default)
    const serverUrl = new URL(env.KEYCLOAK_ISSUER);
    const allowInsecure = serverUrl.protocol === "http:";
    _config = await openidClient.discovery(
      serverUrl,
      env.KEYCLOAK_CLIENT_ID,
      env.KEYCLOAK_CLIENT_SECRET,
      undefined,
      allowInsecure
        ? { execute: [openidClient.allowInsecureRequests] }
        : undefined,
    );
  }
  return _config;
}

export function getRedirectUri(): string {
  return env.KEYCLOAK_REDIRECT_URI;
}

export async function getAuthorizationUrl(
  state: string,
  codeVerifier: string,
  prompt?: string,
): Promise<string> {
  const config = await getOidcConfig();
  const codeChallenge =
    await openidClient.calculatePKCECodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    redirect_uri: getRedirectUri(),
    scope: "openid profile email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    ...(prompt ? { prompt } : {}),
  });

  const authorizationUrl = openidClient.buildAuthorizationUrl(config, params);
  return authorizationUrl.href;
}

export async function handleCallback(
  currentUrl: URL,
  expectedState: string,
  codeVerifier: string,
): Promise<{
  sub: string;
  email?: string;
  name?: string;
  groups: string[];
  idToken?: string;
}> {
  const config = await getOidcConfig();

  const tokens = await openidClient.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
  });

  const claims = tokens.claims();
  if (!claims?.sub) throw new Error("No sub in token claims");

  const groups = Array.isArray(claims.groups)
    ? (claims.groups as string[])
    : [];

  return {
    sub: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
    name: typeof claims.name === "string" ? claims.name : undefined,
    groups,
    idToken: typeof tokens.id_token === "string" ? tokens.id_token : undefined,
  };
}

export async function getAdminByEmail(email: string) {
  return prisma.admin.findFirst({
    where: { email, isActive: true },
  });
}

export async function upsertAdminFromKeycloak(email: string, name: string) {
  return prisma.admin.upsert({
    where: { email },
    update: { name, isActive: true },
    create: { email, name, isActive: true },
  });
}

export async function getLogoutUrl(
  postLogoutRedirectUri: string,
  idTokenHint?: string,
): Promise<string> {
  const config = await getOidcConfig();
  const endSessionUrl = openidClient.buildEndSessionUrl(config, {
    post_logout_redirect_uri: postLogoutRedirectUri,
    ...(idTokenHint ? { id_token_hint: idTokenHint } : {}),
  });
  return endSessionUrl.href;
}

export async function getKeycloakUsers(): Promise<
  Array<{
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled: boolean;
  }>
> {
  // Derive base URL and realm from KEYCLOAK_WANNABE_ISSUER (e.g. https://sso.tg.no/realms/wannabe)
  const issuerUrl = new URL(env.KEYCLOAK_WANNABE_ISSUER);
  const realmMatch = issuerUrl.pathname.match(/^\/realms\/([^/]+)/);
  if (!realmMatch)
    throw new Error("Could not parse realm from KEYCLOAK_WANNABE_ISSUER");
  const realm = realmMatch[1];
  const baseUrl = issuerUrl.origin;

  // Get access token via client credentials
  const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.KEYCLOAK_WANNABE_CLIENT_ID,
      client_secret: env.KEYCLOAK_WANNABE_CLIENT_SECRET,
    }),
  });
  if (!tokenRes.ok)
    throw new Error(`Failed to get Keycloak token: ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();

  // Resolve group ID from name
  const groupName = env.KEYCLOAK_WANNABE_GROUP;
  const groupsUrl = `${baseUrl}/admin/realms/${realm}/groups?search=${encodeURIComponent(groupName)}&exact=true`;
  const groupsRes = await fetch(groupsUrl, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!groupsRes.ok) {
    const detail = (await groupsRes.text().catch(() => "")).slice(0, 300);
    const wwwAuth = groupsRes.headers.get("www-authenticate") ?? "";
    throw new Error(
      `Failed to fetch Keycloak groups: ${groupsRes.status} ${wwwAuth} ${detail}`,
    );
  }
  const groups: Array<{ id: string; name: string }> = await groupsRes.json();
  const group = groups.find((g) => g.name === groupName);
  if (!group)
    throw new Error(`Keycloak group "${groupName}" not found in realm "${realm}"`);

  // Fetch group members (paginated, max 1000)
  const usersUrl = `${baseUrl}/admin/realms/${realm}/groups/${group.id}/members?max=1000`;
  const usersRes = await fetch(usersUrl, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!usersRes.ok)
    throw new Error(`Failed to fetch Keycloak users: ${usersRes.status}`);
  return usersRes.json();
}
