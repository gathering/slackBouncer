<script lang="ts">
  let { data } = $props();

  let isEnabled = $state(false);
  let allowAllUsers = $state(false);
  let selectedUserIds: string[] = $state([]);

  $effect(() => {
    isEnabled = data.channel.isEnabled;
    allowAllUsers = data.channel.allowAllUsers;
    selectedUserIds = [...data.channel.allowedUserIds];
  });
  let saving = $state(false);
  let toast = $state("");
  let userSearch = $state("");

  const filteredUsers = $derived(
    data.allUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email?.toLowerCase().includes(userSearch.toLowerCase()) ?? false),
    ),
  );

  async function toggleEnabled() {
    saving = true;
    try {
      const res = await fetch(`/api/channels/${data.channel.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !isEnabled }),
      });
      if (!res.ok) throw new Error("Failed");
      isEnabled = !isEnabled;
      toast = `Channel ${isEnabled ? "enabled" : "disabled"}`;
    } catch {
      toast = "Failed to update";
    } finally {
      saving = false;
      setTimeout(() => (toast = ""), 3000);
    }
  }

  async function toggleAllowAllUsers() {
    saving = true;
    try {
      const res = await fetch(`/api/channels/${data.channel.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowAllUsers: !allowAllUsers }),
      });
      if (!res.ok) throw new Error("Failed");
      allowAllUsers = !allowAllUsers;
      toast = allowAllUsers
        ? "All channel members can now use /allaihopa"
        : "Reverted to allowlist";
    } catch {
      toast = "Failed to update";
    } finally {
      saving = false;
      setTimeout(() => (toast = ""), 3000);
    }
  }

  async function saveAllowlist() {
    saving = true;
    try {
      const res = await fetch(
        `/api/channels/${data.channel.id}/allowed-users`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: selectedUserIds }),
        },
      );
      if (!res.ok) throw new Error("Failed");
      toast = "Allowlist saved";
    } catch {
      toast = "Failed to save";
    } finally {
      saving = false;
      setTimeout(() => (toast = ""), 3000);
    }
  }

  function toggleUser(userId: string) {
    if (selectedUserIds.includes(userId)) {
      selectedUserIds = selectedUserIds.filter((id) => id !== userId);
    } else {
      selectedUserIds = [...selectedUserIds, userId];
    }
  }

  function isGlobal(userId: string) {
    return data.globalUserIds.includes(userId);
  }
</script>

<div class="mb-4">
  <a href="/admin" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
    >← Back to channels</a
  >
</div>

<div class="flex items-center justify-between mb-6">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">#{data.channel.name}</h1>
  <div class="flex items-center gap-3">
    <span class="text-sm text-gray-500 dark:text-gray-400">
      {data.channel.isGeneral
        ? "General"
        : data.channel.isPrivate
          ? "Private"
          : "Public"}
    </span>
  </div>
</div>

{#if toast}
  <div class="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
    {toast}
  </div>
{/if}

<div class="grid gap-6">
  <!-- Enable/disable card -->
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-gray-100">Command enabled</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Allow /allaihopa to be used in this channel
        </p>
      </div>
      <button
        onclick={toggleEnabled}
        disabled={saving}
        aria-label={isEnabled ? "Disable channel" : "Enable channel"}
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {isEnabled
          ? 'bg-indigo-600'
          : 'bg-gray-300 dark:bg-gray-600'} disabled:opacity-50"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isEnabled
            ? 'translate-x-6'
            : 'translate-x-1'}"
        ></span>
      </button>
    </div>
  </div>

  <!-- Allow all users card -->
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-gray-100">Allow all channel members</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Any member of this channel can use /allaihopa, regardless of the
          allowlist below
        </p>
      </div>
      <button
        onclick={toggleAllowAllUsers}
        disabled={saving}
        aria-label={allowAllUsers ? "Disable allow all" : "Enable allow all"}
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none {allowAllUsers
          ? 'bg-indigo-600'
          : 'bg-gray-300 dark:bg-gray-600'} disabled:opacity-50"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {allowAllUsers
            ? 'translate-x-6'
            : 'translate-x-1'}"
        ></span>
      </button>
    </div>
  </div>

  <!-- Allowlist card -->
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-semibold text-gray-900 dark:text-gray-100">Channel allowlist</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Users allowed via this channel (in addition to global list)
        </p>
      </div>
      <button
        onclick={saveAllowlist}
        disabled={saving}
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>

    <input
      bind:value={userSearch}
      placeholder="Search users..."
      class="w-full max-w-sm mb-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />

    <div
      class="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-700"
    >
      {#each filteredUsers as user}
        <label
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedUserIds.includes(user.id)}
            onchange={() => toggleUser(user.id)}
            class="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          <span class="flex-1 text-sm">
            <span class="font-medium text-gray-900 dark:text-gray-100">{user.displayName}</span>
            {#if user.email}
              <span class="text-gray-500 dark:text-gray-400 ml-1">({user.email})</span>
            {/if}
          </span>
          {#if isGlobal(user.id)}
            <span
              class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded"
              >Global</span
            >
          {/if}
        </label>
      {:else}
        <div class="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          No users found
        </div>
      {/each}
    </div>

    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
      {selectedUserIds.length} selected · {data.globalUserIds.length} global users
      always allowed
    </p>
  </div>
</div>
