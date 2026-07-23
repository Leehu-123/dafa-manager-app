import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        content,
        authorId: session.user.id,
      },
      include: {
        author: true,
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("POST Task Comment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
