<script lang="ts">
  let { data, children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
  <nav
    class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between"
  >
    <div class="flex items-center gap-6">
      <a href="/admin" class="font-bold text-lg text-indigo-700">slackBouncer</a
      >
      <a href="/admin" class="text-sm text-gray-600 hover:text-gray-900"
        >Channels</a
      >
      <a href="/admin/global" class="text-sm text-gray-600 hover:text-gray-900"
        >Global Allowlist</a
      >
      <a href="/admin/stats" class="text-sm text-gray-600 hover:text-gray-900"
        >Stats</a
      >
      <a href="/admin/users" class="text-sm text-gray-600 hover:text-gray-900"
        >Users</a
      >
      <a href="/admin/audit" class="text-sm text-gray-600 hover:text-gray-900"
        >Audit</a
      >
    </div>
    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-600">{data.admin.name}</span>
      <form method="POST" action="/auth/logout">
        <button type="submit" class="text-sm text-red-600 hover:text-red-800"
          >Logout</button
        >
      </form>
    </div>
  </nav>
  <main class="max-w-6xl mx-auto px-6 py-8">
    {@render children()}
  </main>
</div>
