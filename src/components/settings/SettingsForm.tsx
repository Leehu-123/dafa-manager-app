"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SettingsForm({ initialToken }: { initialToken: string }) {
  const [token, setToken] = useState(initialToken || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      const res = await fetch("/api/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramBotToken: token }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(`Lỗi: ${await res.text()}`);
      }
    } catch (error) {
      console.error("Error saving settings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-dafa-border/50 shadow-sm p-6">
      <h2 className="font-semibold text-dafa-primary text-lg mb-4">Cấu hình Thông báo Telegram</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-dafa-text block mb-1">Telegram Bot Token</label>
          <Input 
            type="text" 
            placeholder="Ví dụ: 123456789:ABCdefGHIjklmNOPqrsTUVwxyz"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-dafa-muted mt-2">
            Token lấy từ <a href="https://t.me/botfather" target="_blank" className="text-blue-500 hover:underline">@BotFather</a>. Điền token sẽ tự động bật chức năng thông báo task mới và nhắc deadline mỗi ngày. Bỏ trống để tắt.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading} className="bg-[#A14F39] text-white hover:bg-[#8a3f2d]">
            {loading ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
          {success && <span className="text-sm text-green-600 font-medium">Lưu thành công!</span>}
        </div>
      </form>
    </div>
  );
}
