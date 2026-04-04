import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { syncSlackChannels } from "$lib/server/services/sync";
import { logAudit } from "$lib/server/services/audit";

export const POST: RequestHandler = async ({ locals }) => {
  if (!locals.admin) throw error(401, "Unauthorized");

  const result = await syncSlackChannels();
  await logAudit(locals.admin.id, "sync", "slack_channels", {
    synced: result.synced,
  });

  return json(result);
};
