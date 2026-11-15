# slackBouncer

Internal Slack tool that lets authorized users send `@channel` / `@everyone` messages via the `/allaihopa` slash command, with a web-based admin UI protected by Keycloak.

Admins control which Slack channels the command is enabled in, and which users are allowed to use it — either per-channel or via a global allowlist.

## Tech Stack

- **SvelteKit** (Node adapter) — frontend + API
- **Tailwind CSS v4** — styling
- **PostgreSQL + Prisma** — database
- **Slack Web API** — posting messages, checking membership
- **Keycloak (OIDC)** — admin authentication
- **Docker + Kubernetes** — deployment

See [DEVELOPER.md](DEVELOPER.md) for local development setup.

---

## Production Setup

### Environment Variables

| Variable                  | Description                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string                                      |
| `SLACK_BOT_TOKEN`         | Bot token (`xoxb-...`)                                            |
| `SLACK_SIGNING_SECRET`    | From Slack app settings → Basic Information                       |
| `KEYCLOAK_ISSUER`         | e.g. `https://keycloak.example.com/realms/myrealm`                |
| `KEYCLOAK_CLIENT_ID`      | Keycloak client ID                                                |
| `KEYCLOAK_CLIENT_SECRET`  | Keycloak client secret                                            |
| `KEYCLOAK_REDIRECT_URI`   | e.g. `https://your-domain/auth/callback`                          |
| `KEYCLOAK_REQUIRED_GROUP` | Keycloak group name required for access (default: `slackbouncer`) |
| `SESSION_SECRET`          | Random 32+ char string                                            |

### Slack App

1. Go to https://api.slack.com/apps → Create New App
2. **Slash Commands** → Add `/allaihopa` → Request URL: `https://your-domain/slack/commands`
3. **OAuth & Permissions** → Bot Token Scopes: `chat:write`, `channels:read`, `channels:join`, `channels:members:read`, `users:read`, `users:read.email`
4. Install app to workspace → copy **Bot User OAuth Token** → `SLACK_BOT_TOKEN`
5. **Basic Information** → copy **Signing Secret** → `SLACK_SIGNING_SECRET`

### Keycloak

1. Create a realm and a client with authentication enabled
2. Valid redirect URIs: `https://your-domain/auth/callback`
3. Copy client secret → `KEYCLOAK_CLIENT_SECRET`

---

## Deployment

### Docker

```bash
docker build -t slackbouncer:latest .
docker run -p 3000:3000 --env-file .env slackbouncer:latest
```

### Kubernetes

The image is built and pushed to `ghcr.io/gathering/slackbouncer` by `.github/workflows/build-image.yaml`. The production deployment is in [gathering/sys-k8s-apps](https://github.com/gathering/sys-k8s-apps), `source/slackbouncer`. Apply the schema with `prisma migrate deploy` before the app starts.

---

## Admin UI

| Page             | URL                   |
| ---------------- | --------------------- |
| Channels         | `/admin`              |
| Channel config   | `/admin/channels/:id` |
| Global allowlist | `/admin/global`       |
| Stats            | `/admin/stats`        |
| Audit log        | `/admin/audit`        |

**Workflow:**

1. Sync channels and users from Slack
2. Enable a channel (bot auto-joins)
3. Toggle **Allow all channel members** or add users to the allowlist
4. Users can now run `/allaihopa` in that channel

---

## API Endpoints

| Method    | Path                              | Description                 |
| --------- | --------------------------------- | --------------------------- |
| `GET`     | `/api/slack/channels`             | List channels               |
| `GET`     | `/api/slack/users`                | List users                  |
| `POST`    | `/api/sync/slack/channels`        | Sync channels from Slack    |
| `POST`    | `/api/sync/slack/users`           | Sync users from Slack       |
| `GET`     | `/api/channels/:id`               | Get channel                 |
| `PUT`     | `/api/channels/:id/settings`      | Enable/disable channel      |
| `GET/PUT` | `/api/channels/:id/allowed-users` | Manage channel allowlist    |
| `GET/PUT` | `/api/global-allowed-users`       | Manage global allowlist     |
| `GET`     | `/api/stats/usage`                | Usage summary               |
| `GET`     | `/api/stats/usage/events`         | Usage events (paginated)    |
| `GET`     | `/api/audit`                      | Audit log (paginated)       |
| `POST`    | `/slack/commands`                 | Slack slash command handler |
| `GET`     | `/healthz`                        | Liveness probe              |
| `GET`     | `/readyz`                         | Readiness probe             |

---

## Architecture Notes

- **No message text is stored** — only `had_text: boolean` is recorded
- **No Slack membership caching** — checked live on every command
- **Session** uses HMAC-signed cookies (no server-side store needed)

- **Authorization** is checked in order: channel enabled → user in channel → global list → channel list
