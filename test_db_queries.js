const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log("No user");

    console.log("Testing Branch sort_order query...");
    const branches = await prisma.$queryRawUnsafe(`SELECT id, sort_order FROM "Branch" WHERE "company_id" = $1::uuid`, user.companyId);
    console.log("Branches:", branches.length);

    console.log("Testing Department sort_order query...");
    const depts = await prisma.$queryRawUnsafe(`SELECT id, sort_order FROM "Department"`);
    console.log("Departments:", depts.length);

    console.log("SUCCESS");
  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
