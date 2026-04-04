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
  <h1 class="text-2xl font-bold text-gray-900">Users</h1>
  <div class="text-sm text-gray-500">
    {data.slackUsers.length} Slack · {data.keycloakUsers.length} Keycloak
  </div>
</div>

{#if data.keycloakError}
  <div
    class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
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
      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}"
  >
    Slack ({data.slackUsers.length})
  </button>
  <button
    onclick={() => (tab = "keycloak")}
    class="px-4 py-2 rounded-lg text-sm font-medium {tab === 'keycloak'
      ? 'bg-indigo-600 text-white'
      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}"
  >
    Keycloak ({data.keycloakUsers.length})
  </button>
  <button
    onclick={() => (tab = "missing")}
    class="px-4 py-2 rounded-lg text-sm font-medium {tab === 'missing'
      ? 'bg-indigo-600 text-white'
      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}"
  >
    Mismatches ({slackOnly.length + keycloakOnly.length})
  </button>
</div>

<input
  type="text"
  placeholder="Search users..."
  bind:value={search}
  class="mb-4 w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
/>

{#if tab === "slack"}
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Name</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Email</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600"
            >In Keycloak</th
          >
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each filteredSlack as user}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-900">{user.name}</td>
            <td class="px-4 py-3 text-gray-500">{user.email ?? "—"}</td>
            <td class="px-4 py-3">
              {#if !user.email}
                <span class="text-gray-400 text-xs">No email</span>
              {:else if user.inKeycloak}
                <span class="text-green-600 text-xs font-medium">✓ Yes</span>
              {:else}
                <span class="text-red-500 text-xs font-medium">✗ No</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else if tab === "keycloak"}
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Name</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Email</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">Enabled</th>
          <th class="px-4 py-3 text-left font-medium text-gray-600">In Slack</th
          >
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each filteredKeycloak as user}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-900">{user.name}</td>
            <td class="px-4 py-3 text-gray-500">{user.email ?? "—"}</td>
            <td class="px-4 py-3">
              {#if user.enabled}
                <span class="text-green-600 text-xs font-medium">✓ Active</span>
              {:else}
                <span class="text-gray-400 text-xs">Disabled</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              {#if !user.email}
                <span class="text-gray-400 text-xs">No email</span>
              {:else if user.inSlack}
                <span class="text-green-600 text-xs font-medium">✓ Yes</span>
              {:else}
                <span class="text-red-500 text-xs font-medium">✗ No</span>
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
        <h2 class="text-base font-semibold text-gray-700 mb-2">
          In Slack, not in Keycloak ({slackOnly.length})
        </h2>
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-600"
                  >Name</th
                >
                <th class="px-4 py-3 text-left font-medium text-gray-600"
                  >Email</th
                >
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {#each slackOnly as user}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-900">{user.name}</td>
                  <td class="px-4 py-3 text-gray-500">{user.email}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if keycloakOnly.length > 0}
      <div>
        <h2 class="text-base font-semibold text-gray-700 mb-2">
          In Keycloak, not in Slack ({keycloakOnly.length})
        </h2>
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left font-medium text-gray-600"
                  >Name</th
                >
                <th class="px-4 py-3 text-left font-medium text-gray-600"
                  >Email</th
                >
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {#each keycloakOnly as user}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-900">{user.name}</td>
                  <td class="px-4 py-3 text-gray-500">{user.email}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    {#if slackOnly.length === 0 && keycloakOnly.length === 0}
      <p class="text-gray-500 text-sm">No mismatches found.</p>
    {/if}
  </div>
{/if}
