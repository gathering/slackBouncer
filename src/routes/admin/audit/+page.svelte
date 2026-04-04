<script lang="ts">
  let { data } = $props();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString();
  }
</script>

<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Audit Log</h1>

<div
  class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
>
  <table class="w-full text-sm">
    <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <tr>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Time</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Admin</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Action</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Entity</th>
        <th class="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Details</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
      {#each data.logs as log}
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td class="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap"
            >{formatDate(log.createdAt)}</td
          >
          <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{log.adminName}</td>
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{log.action}</td>
          <td class="px-4 py-3 text-gray-700 dark:text-gray-300">{log.entity}</td>
          <td
            class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono max-w-xs truncate"
          >
            {JSON.stringify(log.details)}
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
            >No audit logs yet</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
