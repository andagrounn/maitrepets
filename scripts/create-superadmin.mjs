import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email    = 'xia@maitrepets.com';
  const password = 'xia2020';
  const name     = 'Xia';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists:', email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user   = await prisma.user.create({
    data: { email, password: hashed, name },
  });

  console.log('Created user:', user.email, '(id:', user.id + ')');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
