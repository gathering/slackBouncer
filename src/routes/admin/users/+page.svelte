<script lang="ts">
  let { data } = $props();

  let tab = $state<"slack" | "keycloak" | "missing">("slack");
  let search = $state("");

  const filteredSlack = $derived(
    data.slackUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false),
    ),
  );

  const filteredKeycloak = $derived(
    data.keycloakUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false),
    ),
  );

  // Slack users not in Keycloak
  const slackOnly = $derived(
    data.slackUsers.filter(
      (u) =>
        u.email &&
        !u.inKeycloak &&
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())),
    ),
  );

  // Keycloak users not in Slack
  const keycloakOnly = $derived(
    data.keycloakUsers.filter(
      (u) =>
        u.email &&
        !u.inSlack &&
        u.enabled &&
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
          (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false)),
    ),
  );
</script>

<div class="flex items-center justify-between mb-6">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
  <div class="text-sm text-gray-500 dark:text-gray-400">
    {data.slackUsers.length} Slack · {data.keycloakUsers.length} Keycloak
  </div>
</div>

{#if data.keycloakError}
  <div
    class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300"
  >
    Could not fetch Keycloak users. Make sure the client has the <code
      >view-users</code
    >
    role under <code>realm-management</code>.
  </div>
{/if}

<div class="mb-4 flex gap-2">
  <button
    onclick={() => (tab = "slack")}
    class="px-4 py-2 rounded-lg text-sm font-medium {tab === 'slack'
      ? 'bg-indigo-600 text-white'
      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
  >
    Slack ({data.slackUsers.length})
  </button>
  <button
    onclick={() => (tab = "keycloak")}
    class="px-4 py-2 rounded-lg text-sm font-medium {tab === 'keycloak'
      ? 'bg-indigo-600 text-white'
      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
  >
    Keycloak ({data.keycloakUsers.length})
  </button>
  <button
    onclick={() => (tab = "missing")}
    class="px-4 py-2 rounded-lg text-sm font-medium {tab === 'missing'
      ? 'bg-indigo-600 text-white'
      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
  >
    Mismatches ({slackOnly.length + keycloakOnly.length})
  </button>
</div>

<input
  type="text"
  placeholder="Search users..."
  bind:value={search}
  class="mb-4 w-full max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
/>

{#if tab === "slack"}
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Name</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Email</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Type</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300"
            >In Keycloak</th
          >
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        {#each filteredSlack as user}
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{user.name}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email ?? "—"}</td>
            <td class="px-4 py-3">
              {#if user.isUltraRestricted}
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">Single-channel guest</span>
              {:else if user.isRestricted}
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Multi-channel guest</span>
              {:else}
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Member</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              {#if !user.email}
                <span class="text-gray-400 dark:text-gray-500 text-xs">No email</span>
              {:else if user.inKeycloak}
                <span class="text-green-600 dark:text-green-400 text-xs font-medium">✓ Yes</span>
              {:else}
                <span class="text-red-500 dark:text-red-400 text-xs font-medium">✗ No</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else if tab === "keycloak"}
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Name</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Email</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Enabled</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">In Slack</th
          >
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        {#each filteredKeycloak as user}
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{user.name}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email ?? "—"}</td>
            <td class="px-4 py-3">
              {#if user.enabled}
                <span class="text-green-600 dark:text-green-400 text-xs font-medium">✓ Active</span>
              {:else}
                <span class="text-gray-400 dark:text-gray-500 text-xs">Disabled</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              {#if !user.email}
                <span class="text-gray-400 dark:text-gray-500 text-xs">No email</span>
              {:else if user.inSlack}
                <span class="text-green-600 dark:text-green-400 text-xs font-medium">✓ Yes</span>
              {:else}
                <span class="text-red-500 dark:text-red-400 text-xs font-medium">✗ No</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="space-y-6">
    {#if slackOnly.length > 0}
      <div>
        <h2 class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
          In Slack, not in Keycloak ({slackOnly.length})
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300"
                  >Name</th
                >
                <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300"
                  >Email</th
                >
                <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300"
                  >Type</th
                >
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              {#each slackOnly as user}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{user.name}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td class="px-4 py-3">
                    {#if user.isUltraRestricted}
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">Single-channel guest</span>
                    {:else if user.isRestricted}
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Multi-channel guest</span>
                    {:else}
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Member</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if keycloakOnly.length > 0}
      <div>
        <h2 class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
          In Keycloak, not in Slack ({keycloakOnly.length})
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300"
                  >Name</th
                >
                <th class="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300"
                  >Email</th
                >
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              {#each keycloakOnly as user}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-4 py-3 text-gray-900 dark:text-gray-100">{user.name}</td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if slackOnly.length === 0 && keycloakOnly.length === 0}
      <p class="text-gray-500 dark:text-gray-400 text-sm">No mismatches found.</p>
    {/if}
  </div>
{/if}
