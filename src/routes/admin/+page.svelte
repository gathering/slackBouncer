<script lang="ts">
  let { data } = $props();

  let search = $state("");
  let syncing = $state(false);
  let toast = $state("");

  const filtered = $derived(
    data.channels.filter((ch) =>
      ch.name.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  async function syncChannels() {
    syncing = true;
    try {
      const res = await fetch("/api/sync/slack/channels", { method: "POST" });
      const json = await res.json();
      toast = `Synced ${json.synced} channels`;
      setTimeout(() => location.reload(), 1000);
    } catch {
      toast = "Sync failed";
    } finally {
      syncing = false;
      setTimeout(() => (toast = ""), 3000);
    }
  }
</script>

<div class="flex items-center justify-between mb-6">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Channels</h1>
  <button
    onclick={syncChannels}
    disabled={syncing}
    class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
  >
    {syncing ? "Syncing..." : "Sync from Slack"}
  </button>
</div>

{#if toast}
  <div class="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
    {toast}
  </div>
{/if}

<div class="mb-4">
  <input
    bind:value={search}
    placeholder="Search channels..."
    class="w-full max-w-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
</div>

<div
  class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
>
  <table class="w-full text-sm">
    <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <tr>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Channel</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Type</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
        <th class="px-4 py-3"></th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
      {#each filtered as ch}
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">#{ch.name}</td>
          <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
            {ch.isGeneral ? "General" : ch.isPrivate ? "Private" : "Public"}
          </td>
          <td class="px-4 py-3">
            {#if ch.isEnabled}
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                >Enabled</span
              >
            {:else}
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >Disabled</span
              >
            {/if}
          </td>
          <td class="px-4 py-3 text-right">
            <a
              href="/admin/channels/{ch.id}"
              class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">Configure →</a
            >
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="4" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            {data.channels.length === 0
              ? 'No channels synced yet. Click "Sync from Slack".'
              : "No channels match your search."}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
