import { prisma } from "@/lib/prisma";

/**
 * Sends a Telegram message to a specific chat ID.
 */
export async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
    
    if (!res.ok) {
      console.error("[TELEGRAM_ERROR]", await res.text());
    }
  } catch (error) {
    console.error("[TELEGRAM_EXCEPTION]", error);
  }
}

/**
 * Helper to fetch company token and user chat IDs, then send the message.
 */
export async function notifyUsersViaTelegram(companyId: string, userIds: string[], message: string) {
  try {
    // 1. Get company bot token
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { telegramBotToken: true }
    });

    if (!company?.telegramBotToken) return;

    // 2. Get users with telegramChatId
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        telegramChatId: { not: null }
      },
      select: { telegramChatId: true }
    });

    // 3. Send messages
    const promises = users
      .filter(u => u.telegramChatId)
      .map(u => sendTelegramMessage(company.telegramBotToken!, u.telegramChatId!, message));

    await Promise.all(promises);
  } catch (error) {
    console.error("[NOTIFY_USERS_TELEGRAM_ERROR]", error);
  }
}
