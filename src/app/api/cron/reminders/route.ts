import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUsersViaTelegram } from "@/lib/telegram";

export async function GET(req: Request) {
  try {
    // In production, this should be protected by a secret key in the headers
    // e.g. if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Start of tomorrow
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);
    
    // End of tomorrow
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const tasksDueTomorrow = await prisma.task.findMany({
      where: {
        deadline: {
          gte: startOfTomorrow,
          lte: endOfTomorrow
        },
        status: {
          notIn: ["DONE", "OVERDUE"]
        }
      },
      include: {
        assignees: true,
      }
    });

    let count = 0;

    for (const task of tasksDueTomorrow) {
      if (task.assignees.length > 0) {
        const userIds = task.assignees.map(a => a.userId);
        const msg = `⏰ <b>NHẮC NHỞ DEADLINE</b>\n\n📌 <b>Tiêu đề:</b> ${task.title}\n⏳ <b>Hạn chót:</b> Ngày mai\n\nVui lòng hoàn thành công việc trước thời hạn.`;
        
        // This is async and we don't await sequentially to speed up,
        // but for safety in serverless we should await or use Promise.all
        await notifyUsersViaTelegram(task.companyId, userIds, msg);
        count++;
      }
    }

    return NextResponse.json({ success: true, processedTasks: count });
  } catch (error) {
    console.error("[CRON_REMINDERS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
