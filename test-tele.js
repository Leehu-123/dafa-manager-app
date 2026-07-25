const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  const users = await prisma.user.findMany();
  
  console.log("Token:", company?.telegramBotToken);
  
  for (const u of users) {
    console.log(`User ${u.email} - Chat ID: ${u.telegramChatId}`);
    if (u.telegramChatId && company?.telegramBotToken) {
      console.log(`Sending to ${u.telegramChatId}...`);
      const res = await fetch(`https://api.telegram.org/bot${company.telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: u.telegramChatId,
          text: "Test notification from DAFA Manager"
        })
      });
      console.log("Status:", res.status);
      console.log("Response:", await res.text());
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
