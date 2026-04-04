<script lang="ts">
  let { data } = $props();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }
</script>

<h1 class="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

<div
  class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
>
  <table class="w-full text-sm">
    <thead class="bg-gray-50 border-b border-gray-200">
      <tr>
        <th class="text-left px-4 py-3 font-medium text-gray-700">Time</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700">Admin</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700">Action</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700">Entity</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700">Details</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      {#each data.logs as log}
        <tr class="hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-500 whitespace-nowrap"
            >{formatDate(log.createdAt)}</td
          >
          <td class="px-4 py-3 font-medium text-gray-900">{log.adminName}</td>
          <td class="px-4 py-3 text-gray-700">{log.action}</td>
          <td class="px-4 py-3 text-gray-700">{log.entity}</td>
          <td
            class="px-4 py-3 text-gray-500 text-xs font-mono max-w-xs truncate"
          >
            {JSON.stringify(log.details)}
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-gray-500"
            >No audit logs yet</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
