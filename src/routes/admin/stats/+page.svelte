<script lang="ts">
  let { data } = $props();
</script>

<h1 class="text-2xl font-bold text-gray-900 mb-6">Usage Stats</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <p class="text-sm text-gray-500">Total uses</p>
    <p class="text-3xl font-bold text-indigo-700 mt-1">{data.total}</p>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <p class="text-sm text-gray-500">Unique users</p>
    <p class="text-3xl font-bold text-indigo-700 mt-1">{data.byUser.length}</p>
  </div>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <p class="text-sm text-gray-500">Active channels</p>
    <p class="text-3xl font-bold text-indigo-700 mt-1">
      {data.byChannel.length}
    </p>
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 class="font-semibold text-gray-900 mb-4">Top users</h2>
    {#if data.byUser.length === 0}
      <p class="text-sm text-gray-500">No data yet</p>
    {:else}
      <div class="space-y-2">
        {#each data.byUser as u}
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-900">{u.displayName}</span>
            <span class="font-semibold text-indigo-700">{u.count}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 class="font-semibold text-gray-900 mb-4">Top channels</h2>
    {#if data.byChannel.length === 0}
      <p class="text-sm text-gray-500">No data yet</p>
    {:else}
      <div class="space-y-2">
        {#each data.byChannel as ch}
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-900">#{ch.name}</span>
            <span class="font-semibold text-indigo-700">{ch.count}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
