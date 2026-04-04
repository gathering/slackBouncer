<script lang="ts">
  import { untrack } from "svelte";

  let { data } = $props();

  let selectedUserIds: string[] = $state(
    untrack(() => [...data.globalUserIds]),
  );
  let saving = $state(false);
  let syncing = $state(false);
  let toast = $state("");
  let userSearch = $state("");

  const filteredUsers = $derived(
    data.allUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email?.toLowerCase().includes(userSearch.toLowerCase()) ?? false),
    ),
  );

  async function save() {
    saving = true;
    try {
      const res = await fetch("/api/global-allowed-users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });
      if (!res.ok) throw new Error("Failed");
      toast = "Global allowlist saved";
    } catch {
      toast = "Failed to save";
    } finally {
      saving = false;
      setTimeout(() => (toast = ""), 3000);
    }
  }

  async function syncUsers() {
    syncing = true;
    try {
      const res = await fetch("/api/sync/slack/users", { method: "POST" });
      const json = await res.json();
      toast = `Synced ${json.active} active users (${json.synced} total)`;
      setTimeout(() => location.reload(), 4000);
    } catch {
      toast = "Sync failed";
    } finally {
      syncing = false;
      setTimeout(() => (toast = ""), 5000);
    }
  }

  function toggleUser(userId: string) {
    if (selectedUserIds.includes(userId)) {
      selectedUserIds = selectedUserIds.filter((id) => id !== userId);
    } else {
      selectedUserIds = [...selectedUserIds, userId];
    }
  }
</script>

<div class="flex items-center justify-between mb-6">
  <h1 class="text-2xl font-bold text-gray-900">Global Allowlist</h1>
  <div class="flex gap-3">
    <button
      onclick={syncUsers}
      disabled={syncing}
      class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
    >
      {syncing ? "Syncing..." : "Sync Users"}
    </button>
    <button
      onclick={save}
      disabled={saving}
      class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
    >
      {saving ? "Saving..." : "Save"}
    </button>
  </div>
</div>

{#if toast}
  <div class="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
    {toast}
  </div>
{/if}

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <p class="text-sm text-gray-500 mb-4">
    Users on the global allowlist can use /allaihopa in any enabled channel.
  </p>

  <input
    bind:value={userSearch}
    placeholder="Search users..."
    class="w-full max-w-sm mb-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  <div
    class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100"
  >
    {#each filteredUsers as user}
      <label
        class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
      >
        <input
          type="checkbox"
          checked={selectedUserIds.includes(user.id)}
          onchange={() => toggleUser(user.id)}
          class="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        <span class="flex-1 text-sm flex items-center gap-2">
          <span class="font-medium text-gray-900">{user.displayName}</span>
          {#if user.isUltraRestricted}
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">Single-channel guest</span>
          {:else if user.isRestricted}
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Multi-channel guest</span>
          {/if}
          {#if user.email}
            <span class="text-gray-500">({user.email})</span>
          {/if}
        </span>
      </label>
    {:else}
      <div class="px-4 py-6 text-center text-gray-500 text-sm">
        No users found
      </div>
    {/each}
  </div>

  <p class="text-xs text-gray-500 mt-2">
    {selectedUserIds.length} users selected
  </p>
</div>
