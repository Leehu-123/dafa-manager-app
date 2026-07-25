const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const finalFullName = "Trần Đăng Kiệt";
    const email = "owner@dafa.com";
    const password = "password";
    const role = "ADMIN";
    const phone = "";
    const jobTitle = "Chủ Tịch";
    const finalBranchId = "";
    const departmentIds = [];
    
    const companyId = (await prisma.company.findFirst()).id;
    
    let roleRecord = await prisma.role.findFirst({
      where: { companyId, name: `DAFA_${role}` }
    });

    if (!roleRecord) {
      roleRecord = await prisma.role.create({
        data: {
          companyId,
          name: `DAFA_${role}`,
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        companyId,
        fullName: finalFullName,
        email,
        passwordHash: hashedPassword,
        phone,
        jobTitle,
        primaryBranchId: finalBranchId || null,
        userRoles: {
          create: { roleId: roleRecord.id }
        },
        departmentMember: {
          create: (departmentIds || []).map((deptId) => ({
            departmentId: deptId,
            isHead: role === "MANAGER"
          }))
        }
      },
      include: {
        departmentMember: true,
        userRoles: { include: { role: true } }
      }
    });
    
    console.log("SUCCESS", user.id);
  } catch (error) {
    console.error("ERROR", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
