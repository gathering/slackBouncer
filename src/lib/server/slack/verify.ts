import * as crypto from "node:crypto";
import { env } from "$env/dynamic/private";

export function verifySlackSignature(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const sent = parseInt(timestamp, 10);
  if (!Number.isFinite(sent) || Math.abs(now - sent) > 300) {
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac("sha256", signingSecret);
  hmac.update(sigBaseString);
  const computed = `v0=${hmac.digest("hex")}`;

  // timingSafeEqual throws when the lengths differ
  const a = Buffer.from(computed);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function getSigningSecret(): string {
  return env.SLACK_SIGNING_SECRET;
}
