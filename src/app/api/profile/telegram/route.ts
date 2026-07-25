import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { telegramChatId } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        telegramChatId: telegramChatId || null
      }
    });

    return NextResponse.json({ success: true, telegramChatId: user.telegramChatId });
  } catch (error) {
    console.error("[PROFILE_TELEGRAM_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
