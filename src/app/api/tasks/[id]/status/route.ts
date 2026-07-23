import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });

    await prisma.taskHistory.create({
      data: {
        taskId: id,
        fieldChanged: "status",
        oldValue: existingTask.status,
        newValue: status,
        changedById: session.user.id,
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH Task Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
