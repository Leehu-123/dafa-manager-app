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
    const { fileUrl, fileName, fileType, fileSize } = body;

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: "Missing file information" }, { status: 400 });
    }

    const attachment = await prisma.taskAttachment.create({
      data: {
        taskId: id,
        uploadedById: session.user.id,
        fileUrl,
        fileName,
        fileType,
        fileSize,
      },
      include: {
        uploadedBy: { select: { fullName: true, avatar: true } },
      }
    });

    // Create a history log for the attachment
    await prisma.taskHistory.create({
      data: {
        taskId: id,
        fieldChanged: "Đính kèm file",
        oldValue: "",
        newValue: `Đã đính kèm file: ${fileName}`,
        changedById: session.user.id,
      }
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("POST Attachment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
