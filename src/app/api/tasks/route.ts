import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyUsersViaTelegram } from "@/lib/telegram";

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

    const where: any = { companyId: session.user.companyId, AND: [] };

    // Lọc bỏ công việc ĐÃ HOÀN THÀNH của các tháng trước
    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    where.AND.push({
      OR: [
        { status: { not: "DONE" } },
        { 
          status: "DONE",
          updatedAt: { gte: startOfCurrentMonth }
        }
      ]
    });

    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    if (session.user.role === "MANAGER") {
      const managerDepts = await prisma.departmentMember.findMany({
        where: { userId: session.user.id },
        select: { departmentId: true }
      });
      const deptIds = managerDepts.map(d => d.departmentId);
      if (deptIds.length > 0) {
        if (!departmentId) {
          where.AND.push({
            OR: [
              { departmentId: { in: deptIds } },
              { assignees: { some: { user: { departmentMember: { some: { departmentId: { in: deptIds } } } } } } },
              { createdById: session.user.id }
            ]
          });
        }
      } else {
        where.AND.push({
          OR: [
            { assignees: { some: { userId: session.user.id } } },
            { createdById: session.user.id }
          ]
        });
      }
    } else if (session.user.role === "EMPLOYEE") {
       where.AND.push({
         OR: [
           { assignees: { some: { userId: session.user.id } } },
           { createdById: session.user.id }
         ]
       });
    }

    if (departmentId) where.departmentId = departmentId;
    
    if (assigneeId && session.user.role !== "EMPLOYEE") {
      where.assignees = {
        some: { userId: assigneeId }
      };
    }

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      });
    }

    if (where.AND.length === 0) delete where.AND;

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
        companyId: session.user.companyId,
        title,
        description,
        departmentId: departmentId || null,
        branchId: branchId || null,
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

    if (assignees && assignees.length > 0) {
      const msg = `🔔 <b>CÔNG VIỆC MỚI</b>\n\n📌 <b>Tiêu đề:</b> ${title}\n👤 <b>Người giao:</b> ${session.user.name || session.user.email}\n⏱ <b>Hạn chót:</b> ${deadline ? new Date(deadline).toLocaleDateString('vi-VN') : 'Không có'}\n\nĐăng nhập hệ thống để xem chi tiết.`;
      notifyUsersViaTelegram(session.user.companyId, assignees, msg);
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
