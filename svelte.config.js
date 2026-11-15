import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    // SvelteKit's origin check refuses Slack's slash command, a form post
    // with no Origin header. The same check is in src/hooks.server.ts for
    // every route but that one.
    csrf: { checkOrigin: false },
  },
};

export default config;
