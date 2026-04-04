import { WebClient } from "@slack/web-api";
import { env } from "$env/dynamic/private";

let _client: WebClient | null = null;

function getClient(): WebClient {
  if (!_client) {
    _client = new WebClient(env.SLACK_BOT_TOKEN);
  }
  return _client;
}

export async function postMessage(
  channelId: string,
  text: string,
): Promise<void> {
  await getClient().chat.postMessage({
    channel: channelId,
    text,
    mrkdwn: true,
    link_names: true,
  });
}

export async function joinChannel(channelId: string): Promise<void> {
  await getClient().conversations.join({ channel: channelId });
}

export async function getUsers(): Promise<
  Array<{
    id: string;
    name: string;
    real_name?: string;
    profile?: { display_name?: string; email?: string };
    is_bot?: boolean;
    deleted?: boolean;
  }>
> {
  const results: Array<{
    id: string;
    name: string;
    real_name?: string;
    profile?: { display_name?: string; email?: string };
    is_bot?: boolean;
    deleted?: boolean;
  }> = [];

  let cursor: string | undefined;
  do {
    const response = await getClient().users.list({ cursor, limit: 200 });
    const members = response.members ?? [];
    for (const m of members) {
      if (m.id) {
        results.push(m as (typeof results)[0]);
      }
    }
    cursor = response.response_metadata?.next_cursor || undefined;
  } while (cursor);

  return results;
}

export async function getChannels(): Promise<
  Array<{
    id: string;
    name: string;
    is_general?: boolean;
    is_private?: boolean;
    is_archived?: boolean;
  }>
> {
  const results: Array<{
    id: string;
    name: string;
    is_general?: boolean;
    is_private?: boolean;
    is_archived?: boolean;
  }> = [];

  let cursor: string | undefined;
  do {
    const response = await getClient().conversations.list({
      cursor,
      limit: 200,
      types: "public_channel,private_channel",
    });
    const channels = response.channels ?? [];
    for (const ch of channels) {
      if (ch.id) {
        results.push(ch as (typeof results)[0]);
      }
    }
    cursor = response.response_metadata?.next_cursor || undefined;
  } while (cursor);

  return results;
}

export async function isUserInChannel(
  userId: string,
  channelId: string,
): Promise<boolean> {
  try {
    const response = await getClient().conversations.members({
      channel: channelId,
      limit: 1000,
    });
    const members = response.members ?? [];
    if (members.includes(userId)) return true;

    // paginate if needed
    let cursor = response.response_metadata?.next_cursor;
    while (cursor) {
      const next = await getClient().conversations.members({
        channel: channelId,
        limit: 1000,
        cursor,
      });
      if ((next.members ?? []).includes(userId)) return true;
      cursor = next.response_metadata?.next_cursor || undefined;
    }
    return false;
  } catch {
    return false;
  }
}
