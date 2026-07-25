const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log("No user");

    await prisma.$executeRawUnsafe(
      `UPDATE users SET sort_order = $1 WHERE id = $2::uuid AND company_id = $3::uuid`,
      1, user.id, user.companyId
    );
    console.log("SUCCESS");
  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
