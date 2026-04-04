import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db/client";

export const GET: RequestHandler = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: "ready" });
  } catch {
    return json({ status: "not ready" }, { status: 503 });
  }
};
