import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { telegramBotToken } = body;

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        telegramBotToken: telegramBotToken || null
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("[COMPANY_SETTINGS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
