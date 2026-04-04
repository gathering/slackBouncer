<script lang="ts">
  let { data, children } = $props();

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <nav
    class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between"
  >
    <div class="flex items-center gap-6">
      <a href="/admin" class="font-bold text-lg text-indigo-700 dark:text-indigo-400">slackBouncer</a
      >
      <a href="/admin" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >Channels</a
      >
      <a href="/admin/global" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >Global Allowlist</a
      >
      <a href="/admin/stats" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >Stats</a
      >
      <a href="/admin/users" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >Users</a
      >
      <a href="/admin/audit" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >Audit</a
      >
    </div>
    <div class="flex items-center gap-4">
      <button
        onclick={toggleTheme}
        class="text-lg leading-none text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        aria-label="Toggle theme"
      >
        <span class="dark:hidden">🌙</span>
        <span class="hidden dark:inline">☀️</span>
      </button>
      <span class="text-sm text-gray-600 dark:text-gray-400">{data.admin.name}</span>
      <form method="POST" action="/auth/logout">
        <button type="submit" class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >Logout</button
        >
      </form>
    </div>
  </nav>
  <main class="max-w-6xl mx-auto px-6 py-8">
    {@render children()}
  </main>
</div>
