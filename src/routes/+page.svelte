<script lang="ts">
  let { data } = $props();
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900 mb-2">Allaihopa</h1>
    <p class="text-gray-500 mb-8">Internal Slack announcement tool</p>
    {#if data.error === "unauthorized"}
      <div
        class="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
      >
        Your account doesn't have access to this application. Please contact an
        admin.
      </div>
      <a
        href="/auth/login?prompt=login"
        class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Sign in with a different account
      </a>
    {:else}
      <a
        href="/auth/login"
        class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Sign in
      </a>
    {/if}
  </div>
</div>
