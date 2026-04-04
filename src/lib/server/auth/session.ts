import * as crypto from "node:crypto";
import { env } from "$env/dynamic/private";
import type { RequestEvent } from "@sveltejs/kit";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

interface SessionData {
  adminId: string;
  adminEmail: string;
  adminName: string;
  idToken?: string;
}

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function createSession(event: RequestEvent, data: SessionData): void {
  const payload = JSON.stringify(data);
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = sign(encoded, env.SESSION_SECRET);
  const token = `${encoded}.${sig}`;

  event.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function readSession(event: RequestEvent): SessionData | null {
  const token = event.cookies.get(COOKIE_NAME);
  if (!token) return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);
  const expectedSig = sign(encoded, env.SESSION_SECRET);

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionData;
  } catch {
    return null;
  }
}

export function destroySession(event: RequestEvent): void {
  event.cookies.delete(COOKIE_NAME, { path: "/" });
}
