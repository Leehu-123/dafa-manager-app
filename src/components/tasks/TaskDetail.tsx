"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Clock, MapPin, Building, User, Calendar, Edit, Trash2, Send, Paperclip } from "lucide-react";
import { cn, formatDateTime, formatDate, getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getInitials } from "@/lib/utils";

export default function TaskDetail({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        setTask(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        setComment("");
        fetchTask();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center dafa-muted">Đang tải thông tin...</div>;
  if (!task) return <div className="p-8 text-center text-red-500">Không tìm thấy công việc!</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4 dafa-muted hover:dafa-text">
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold dafa-text">{task.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={cn("text-white", getStatusColor(task.status))}>{getStatusLabel(task.status)}</Badge>
            <Badge variant="outline" className={cn("border", getPriorityColor(task.priority).replace('bg-','text-'))}>{getPriorityLabel(task.priority)}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-gray-600"><Edit className="w-4 h-4 mr-2" />Sửa</Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="w-4 h-4 mr-2" />Xóa</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 dafa-text border-b pb-2">Mô tả công việc</h3>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description || "Không có mô tả."}</div>
          </div>

          <div className="dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 dafa-text border-b pb-2">Bình luận & Thảo luận</h3>
            <div className="space-y-4 mb-4">
              {task.comments?.length === 0 ? (
                <p className="text-sm dafa-muted italic">Chưa có bình luận nào.</p>
              ) : (
                task.comments?.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar src={c.author.avatarUrl} fallback={getInitials(c.author.fullName)} className="w-10 h-10" />
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm">{c.author.fullName}</span>
                        <span className="text-xs dafa-muted">{formatDateTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={submitComment} className="flex gap-2 mt-4">
              <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhập bình luận..." className="flex-1" />
              <Button type="submit" className="dafa-accent bg-[#A14F39] text-white hover:bg-[#8a3f2d]"><Send className="w-4 h-4" /></Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 dafa-text border-b pb-2">Thông tin chung</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Building className="w-4 h-4 dafa-muted" />
                <span>Phòng ban: <span className="font-medium">{task.department?.name || "-"}</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-4 h-4 dafa-muted" />
                <span>Chi nhánh: <span className="font-medium">{task.branch?.name || "-"}</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-4 h-4 dafa-muted" />
                <span>Hạn chót: <span className="font-medium">{task.deadline ? formatDate(task.deadline) : "Không có"}</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <User className="w-4 h-4 dafa-muted" />
                <span>Người tạo: <span className="font-medium">{task.createdBy?.fullName}</span></span>
              </div>
            </div>
          </div>

          <div className="dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 dafa-text border-b pb-2">Người thực hiện</h3>
            <div className="space-y-3">
              {task.assignees?.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3">
                  <Avatar src={a.user.avatarUrl} fallback={getInitials(a.user.fullName)} className="w-8 h-8" />
                  <span className="text-sm font-medium">{a.user.fullName}</span>
                </div>
              ))}
              {task.assignees?.length === 0 && <span className="text-sm dafa-muted">Chưa phân công</span>}
            </div>
          </div>
          
          <div className="dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 dafa-text border-b pb-2">Lịch sử hoạt động</h3>
            <div className="space-y-3">
              {task.histories?.slice(0, 5).map((h: any) => (
                <div key={h.id} className="text-xs">
                  <span className="font-medium">{h.changedBy.fullName}</span>{" "}
                  <span className="text-gray-500">{h.field === 'status' ? 'đã cập nhật trạng thái' : h.newValue}</span>
                  <div className="dafa-muted mt-0.5">{formatDateTime(h.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
