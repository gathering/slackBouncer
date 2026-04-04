import * as crypto from "node:crypto";
import { env } from "$env/dynamic/private";

export function verifySlackSignature(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
    return false;
  }

  const sigBaseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac("sha256", signingSecret);
  hmac.update(sigBaseString);
  const computed = `v0=${hmac.digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export function getSigningSecret(): string {
  return env.SLACK_SIGNING_SECRET;
}
