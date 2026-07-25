import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");

    let whereClause: any = { companyId: session.user.companyId };
    if (branchId) whereClause.primaryBranchId = branchId;
    if (departmentId) whereClause.departmentMember = { some: { departmentId } };
    if (status !== null && status !== undefined && status !== "") {
      whereClause.isActive = status === "true";
    }

    if (session.user.role === "MANAGER" && !departmentId) {
      const managerDepts = await prisma.departmentMember.findMany({
        where: { userId: session.user.id },
        select: { departmentId: true }
      });
      const deptIds = managerDepts.map(d => d.departmentId);
      if (deptIds.length > 0) {
        whereClause.departmentMember = { some: { departmentId: { in: deptIds } } };
      } else {
        whereClause.id = session.user.id;
      }
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      include: {
        primaryBranch: { select: { name: true } },
        departmentMember: {
          include: { department: { select: { name: true } } }
        },
        userRoles: {
          include: { role: { select: { name: true } } }
        }
      },
      orderBy: { fullName: "asc" }
    });

    const sortOrders: any = await prisma.$queryRawUnsafe(`SELECT id, sort_order FROM users WHERE company_id = $1::uuid`, session.user.companyId);
    const sortOrderMap = new Map(sortOrders.map((s: any) => [s.id, s.sort_order]));

    // Map userRoles back to role string for frontend compatibility
    const formattedEmployees = employees.map(emp => {
      const dafaRole = emp.userRoles?.find(ur => ur.role?.name?.toUpperCase().startsWith('DAFA_'));
      const fallbackRole = emp.userRoles?.[0]?.role?.name;
      const finalRoleStr = dafaRole ? dafaRole.role.name.replace('DAFA_', '') : (fallbackRole || 'EMPLOYEE');
      return {
        ...emp,
        role: finalRoleStr.toUpperCase(),
        sortOrder: sortOrderMap.get(emp.id) || 0,
        userRoles: undefined
      };
    });

    return NextResponse.json(formattedEmployees);
  } catch (error) {
    console.error("[EMPLOYEES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { fullName, name, email, password, phone, role, jobTitle, branchId, primaryBranchId, departmentIds } = body;
    
    const finalFullName = fullName || name;
    const finalBranchId = primaryBranchId || branchId;

    if (!finalFullName || !email || !password || !role || !finalBranchId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    let roleRecord = await prisma.role.findFirst({
      where: { companyId: session.user.companyId, name: `DAFA_${role}` }
    });

    if (!roleRecord) {
      // Auto create the role if it doesn't exist for DAFA
      roleRecord = await prisma.role.create({
        data: {
          companyId: session.user.companyId,
          name: `DAFA_${role}`,
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        companyId: session.user.companyId,
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
          create: (departmentIds || []).map((deptId: string) => ({
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

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      ...userWithoutPassword,
      role: userWithoutPassword.userRoles?.[0]?.role?.name || 'EMPLOYEE'
    });
  } catch (error: any) {
    console.error("[EMPLOYEES_POST]", error);
    require('fs').appendFileSync('error.log', `[EMPLOYEES_POST ERROR] ${error?.message || error}\n`);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
