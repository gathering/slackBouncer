-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slack_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "real_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "email" TEXT,
    "is_bot" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slack_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slack_channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_general" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slack_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_settings" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_allowed_users" (
    "id" TEXT NOT NULL,
    "channel_setting_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_allowed_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_allowed_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_allowed_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "had_text" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_log" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "channel_settings_channel_id_key" ON "channel_settings"("channel_id");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "channel_allowed_users_channel_setting_id_user_id_key" ON "channel_allowed_users"("channel_setting_id", "user_id");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "global_allowed_users_user_id_key" ON "global_allowed_users"("user_id");

-- AddForeignKey
ALTER TABLE "channel_settings" ADD CONSTRAINT "channel_settings_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "slack_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_allowed_users" ADD CONSTRAINT "channel_allowed_users_channel_setting_id_fkey" FOREIGN KEY ("channel_setting_id") REFERENCES "channel_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_allowed_users" ADD CONSTRAINT "channel_allowed_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "slack_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_allowed_users" ADD CONSTRAINT "global_allowed_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "slack_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "slack_users"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "slack_channels"("id") ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON UPDATE CASCADE;
