const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@maitrepets.com' },
    update: {},
    create: { email: 'demo@maitrepets.com', password: hash, name: 'Demo User' },
  });
  console.log('Seeded: demo@maitrepets.com / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
