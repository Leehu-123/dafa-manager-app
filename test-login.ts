import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@dafaglass.com' }
  });
  
  if (admin) {
    console.log('Admin found:', admin.email);
    console.log('Password hash:', admin.passwordHash);
    const isValid = await bcrypt.compare('dafa2024', admin.passwordHash);
    console.log('Password valid for "dafa2024":', isValid);
  } else {
    console.log('Admin not found!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
