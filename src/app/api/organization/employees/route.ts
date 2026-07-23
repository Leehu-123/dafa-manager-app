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

    let whereClause: any = {};
    if (branchId) whereClause.primaryBranchId = branchId;
    if (departmentId) whereClause.departmentMember = { some: { departmentId } };
    if (status !== null && status !== undefined && status !== "") {
      whereClause.isActive = status === "true";
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      include: {
        primaryBranch: { select: { name: true } },
        departmentMember: {
          include: { department: { select: { name: true } } }
        }
      },
      orderBy: { fullName: "asc" }
    });

    return NextResponse.json(employees);
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: finalFullName,
        email,
        passwordHash: hashedPassword,
        phone,
        role,
        jobTitle,
        primaryBranchId: finalBranchId,
        departmentMember: {
          create: (departmentIds || []).map((deptId: string) => ({
            departmentId: deptId,
            isManager: role === "MANAGER"
          }))
        }
      },
      include: {
        departmentMember: true
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("[EMPLOYEES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
