# Developer Setup

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) — Node version manager
- [pnpm](https://pnpm.io) — Package manager
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — For running Postgres and Keycloak locally
- [ngrok](https://ngrok.com) — For exposing the local dev server to Slack (`brew install ngrok`)

## 1. Node & dependencies

```bash
nvm use          # picks up .nvmrc automatically
pnpm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — the only values you need to fill in:

| Variable               | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `SLACK_BOT_TOKEN`      | Bot token (`xoxb-...`) from your Slack app        |
| `SLACK_SIGNING_SECRET` | From Slack app → Basic Information                |

All other values are pre-filled in `.env.example` and work out of the box with the local Docker setup.

## 3. Start infrastructure

Starts Postgres and Keycloak via Docker Compose:

```bash
pnpm infra:up
```

- Postgres: `localhost:5432`
- Keycloak admin UI: `http://localhost:8080` (admin / admin)

To stop:

```bash
pnpm infra:down
```

To wipe all data and start fresh:

```bash
pnpm infra:reset
```

## 4. Run database migrations and seed

```bash
pnpm db:migrate
pnpm db:seed
```

The seed creates an admin user (`admin@example.com`) matching the default Keycloak user in `realm.json`.

## 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:5173/admin](http://localhost:5173/admin) — you'll be logged in automatically.

## 6. Expose to Slack via ngrok

The Slack slash command needs a public HTTPS URL to reach your local server.

In a separate terminal:

```bash
ngrok http 5173
```

Copy the `https://xxxx.ngrok-free.app` URL and set it as your Slack app's slash command Request URL:

```
https://xxxx.ngrok-free.app/slack/commands/allaihopa
```

## 7. First-time Slack setup

In the admin UI at [http://localhost:5173/admin](http://localhost:5173/admin):

1. Click **Sync Channels** and **Sync Users**
2. Click a channel → toggle **Command enabled** (the bot auto-joins)
3. Toggle **Allow all channel members**, or add specific users to the allowlist
4. Run `/allaihopa hello` in that Slack channel

## Useful scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start dev server with HMR                |
| `pnpm build`        | Production build                         |
| `pnpm check`        | Type-check with svelte-check             |
| `pnpm format`       | Format all files with Prettier           |
| `pnpm format:check` | Check formatting without writing         |
| `pnpm db:migrate`   | Run pending Prisma migrations            |
| `pnpm db:deploy`    | Apply migrations without generating      |
| `pnpm db:seed`      | Seed the database                        |
| `pnpm db:studio`    | Open Prisma Studio (DB browser)          |
| `pnpm infra:up`     | Start Docker services (Postgres, Keycloak) |
| `pnpm infra:down`   | Stop Docker services                     |
| `pnpm infra:reset`  | Wipe and restart Docker services         |
