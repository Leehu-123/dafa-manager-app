import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        department: true,
        branch: true,
        createdBy: true,
        assignees: { include: { user: true } },
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        attachments: true,
        histories: { include: { changedBy: true }, orderBy: { changedAt: 'desc' } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, departmentId, branchId, priority, status, deadline, assignees } = body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData: any = {
      title,
      description,
      departmentId,
      branchId,
      priority,
      status,
      deadline: deadline ? new Date(deadline) : null,
    };

    if (assignees) {
      updateData.assignees = {
        deleteMany: {},
        create: assignees.map((userId: string) => ({ userId }))
      };
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Simple history log
    await prisma.taskHistory.create({
      data: {
        taskId: id,
        fieldChanged: "Cập nhật",
        oldValue: "",
        newValue: "Thông tin công việc được cập nhật",
        changedById: session.user.id,
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
