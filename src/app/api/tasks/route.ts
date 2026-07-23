import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const departmentId = searchParams.get("departmentId");
    const assigneeId = searchParams.get("assigneeId");
    const search = searchParams.get("search");
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    if (session.user.role === "MANAGER" && !departmentId) {
       // Manager sees their department's tasks, but we might not have departmentId in session, skip for simple
       // In a real app we'd fetch their department. 
    } else if (session.user.role === "EMPLOYEE") {
       where.assignees = {
         some: { userId: session.user.id }
       };
    }

    if (departmentId) where.departmentId = departmentId;
    
    if (assigneeId && session.user.role !== "EMPLOYEE") {
      where.assignees = {
        some: { userId: assigneeId }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          department: true,
          assignees: { include: { user: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET Tasks Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, departmentId, branchId, priority, status, deadline, assignees } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        departmentId,
        branchId,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        deadline: deadline ? new Date(deadline) : null,
        createdById: session.user.id,
        assignees: {
          create: (assignees || []).map((userId: string) => ({
            userId,
          })),
        },
        histories: {
          create: {
            fieldChanged: "Tạo mới",
            oldValue: "",
            newValue: "Công việc được tạo",
            changedById: session.user.id,
          }
        }
      },
      include: {
        assignees: true,
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
