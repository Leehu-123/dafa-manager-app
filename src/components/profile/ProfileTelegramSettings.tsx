"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function ProfileTelegramSettings({ initialChatId }: { initialChatId: string }) {
  const [chatId, setChatId] = useState(initialChatId || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      const res = await fetch("/api/profile/telegram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramChatId: chatId }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(`Lỗi: ${await res.text()}`);
      }
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold dafa-text border-b dafa-border pb-2">Liên kết Telegram</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-dafa-text block mb-1">Telegram Chat ID</label>
          <Input 
            type="text" 
            placeholder="Ví dụ: 123456789"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
          <p className="text-xs text-dafa-muted mt-2">
            Để lấy Chat ID, hãy tìm kiếm <strong>@userinfobot</strong> trên Telegram và bấm Start. Sau đó copy chuỗi số ID dán vào đây để nhận thông báo nhắc việc.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading} className="bg-[#0088cc] text-white hover:bg-[#0077b3]">
            {loading ? "Đang lưu..." : "Lưu Chat ID"}
          </Button>
          {success && <span className="text-sm text-green-600 font-medium">Cập nhật thành công!</span>}
        </div>
      </form>
    </Card>
  );
}
