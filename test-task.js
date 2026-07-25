const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found");
    return;
  }
  try {
    const task = await prisma.task.create({
      data: {
        companyId: user.companyId,
        title: "Test Task",
        createdById: user.id,
        assignees: {
          create: [{ userId: user.id }]
        },
        histories: {
          create: {
            fieldChanged: "Tạo mới",
            oldValue: "",
            newValue: "Công việc được tạo",
            changedById: user.id,
          }
        }
      }
    });
    console.log("Success:", task);
  } catch(e) {
    console.error("Error:", e);
  }
}
main();
