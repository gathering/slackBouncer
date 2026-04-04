import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { syncSlackUsers } from "$lib/server/services/sync";
import { logAudit } from "$lib/server/services/audit";

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const result = await syncSlackUsers();
  await logAudit(locals.admin.id, "sync", "slack_users", {
    synced: result.synced,
    active: result.active,
  });

  return json(result);
};
