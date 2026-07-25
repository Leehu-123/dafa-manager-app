import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        primaryBranch: true,
        departmentMember: { include: { department: true } },
        kpiRecords: {
          take: 5,
          orderBy: { periodStart: 'desc' },
          include: { criteria: true }
        }
      }
    });

    if (!user) return new NextResponse("Not found", { status: 404 });

    const { passwordHash, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[EMPLOYEE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { fullName, name, email, phone, role, jobTitle, primaryBranchId, branchId, isActive, password, departmentIds } = body;
    
    const finalFullName = fullName || name;
    const finalBranchId = primaryBranchId || branchId;

    let updateData: any = {};
    if (finalFullName) updateData.fullName = finalFullName;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (finalBranchId !== undefined) updateData.primaryBranchId = finalBranchId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    if (role) {
      let roleRecord = await prisma.role.findFirst({
        where: { companyId: session.user.companyId, name: `DAFA_${role}` }
      });
      if (!roleRecord) {
        roleRecord = await prisma.role.create({
          data: { companyId: session.user.companyId, name: `DAFA_${role}` }
        });
      }
      
      const userToUpdate = await prisma.user.findUnique({
        where: { id },
        include: { userRoles: { include: { role: true } } }
      });
      const dafaRoleIds = userToUpdate?.userRoles
        .filter(ur => ur.role.name.startsWith('DAFA_'))
        .map(ur => ur.roleId) || [];

      updateData.userRoles = {
        deleteMany: { roleId: { in: dafaRoleIds } },
        create: { roleId: roleRecord.id }
      };
    }

    // Process department updates if provided
    if (departmentIds && Array.isArray(departmentIds)) {
      updateData.departmentMember = {
        deleteMany: {},
        create: departmentIds.map((deptId: string) => ({
          departmentId: deptId,
          isHead: role === "MANAGER"
        }))
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[EMPLOYEE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
