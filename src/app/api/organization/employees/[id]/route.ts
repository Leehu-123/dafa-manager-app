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
    const { fullName, name, phone, role, jobTitle, primaryBranchId, branchId, isActive, password, departmentIds } = body;
    
    const finalFullName = fullName || name;
    const finalBranchId = primaryBranchId || branchId;

    let updateData: any = {};
    if (finalFullName) updateData.fullName = finalFullName;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (finalBranchId) updateData.primaryBranchId = finalBranchId;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Process department updates if provided
    if (departmentIds && Array.isArray(departmentIds)) {
      await prisma.departmentMember.deleteMany({ where: { userId: id } });
      updateData.departmentMember = {
        create: departmentIds.map((deptId: string) => ({
          departmentId: deptId,
          isManager: role === "MANAGER" || (updateData.role === "MANAGER")
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
