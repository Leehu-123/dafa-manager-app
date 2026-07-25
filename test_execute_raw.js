const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log("No user");

    const items = [
      { id: user.id, sortOrder: 99 }
    ];

    await prisma.$transaction(
      items.map(item => {
        return prisma.$executeRawUnsafe(
          `UPDATE users SET sort_order = $1 WHERE id = $2::uuid AND company_id = $3::uuid`, 
          item.sortOrder, item.id, user.companyId
        );
      })
    );
    console.log("SUCCESS");
  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
