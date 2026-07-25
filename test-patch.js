const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const crit = await prisma.kpiCriteria.findFirst();
  if (!crit) {
    console.log("No criteria");
    return;
  }
  
  try {
    const updated = await prisma.kpiCriteria.update({
      where: { id: crit.id },
      data: {
        description: "test update",
        targetValue: 100,
        weightPercent: 15
      }
    });
    console.log("Success:", updated);
  } catch (e) {
    console.error("Prisma error:", e);
  }
}
main().then(() => process.exit(0));
