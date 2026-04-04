import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
const name = process.env.ADMIN_NAME ?? "Local Admin";

async function main() {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  await prisma.admin.create({
    data: { id: randomUUID(), email, name, isActive: true },
  });

  console.log(`Created admin: ${name} <${email}>`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
