"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

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

  const updateTaskStatus = async (newStatus: string) => {
    if (newStatus === task.status) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTask();
      } else {
        alert("Lỗi khi cập nhật trạng thái");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật trạng thái");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleDeleteTask = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/tasks");
      } else {
        alert("Lỗi khi xóa công việc");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xóa công việc");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Upload failed: ${errText}`);
      }
      const data = await uploadRes.json();
      const url = data.url;
      const fileName = data.filename || data.fileName || data.name || file.name;
      const fileSize = data.size || data.fileSize || file.size;
      const fileType = data.mimetype || data.fileType || data.type || file.type;

      const attachRes = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: url, fileName, fileSize, fileType })
      });
      
      if (attachRes.ok) {
        fetchTask();
      } else {
        const attachErr = await attachRes.text();
        throw new Error(`Failed to save attachment: ${attachErr}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Lỗi tải lên file: ${err.message || "Không xác định"}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa file này?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTask();
      } else {
        const errText = await res.text();
        alert(`Lỗi khi xóa file: ${errText}`);
      }
    } catch (err: any) {
      console.error(err);
      alert("Lỗi khi xóa file");
    }
  };

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
            <div className="relative inline-block">
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(e.target.value)}
                disabled={isUpdatingStatus}
                className={cn(
                  "appearance-none font-medium text-white px-3 py-1 pr-7 rounded-full text-xs outline-none cursor-pointer border-none ring-0 shadow-sm transition-opacity",
                  getStatusColor(task.status),
                  isUpdatingStatus && "opacity-50 cursor-not-allowed"
                )}
              >
                <option value="TODO" className="text-gray-900 bg-white font-medium">Chưa bắt đầu</option>
                <option value="IN_PROGRESS" className="text-gray-900 bg-white font-medium">Đang thực hiện</option>
                <option value="REVIEW" className="text-gray-900 bg-white font-medium">Chờ duyệt</option>
                <option value="DONE" className="text-gray-900 bg-white font-medium">Hoàn thành</option>
                <option value="OVERDUE" className="text-gray-900 bg-white font-medium">Trễ hạn</option>
                <option value="CANCELLED" className="text-gray-900 bg-white font-medium">Đã hủy</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/90">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            <Badge variant="outline" className={cn("border", getPriorityColor(task.priority).replace('bg-','text-'))}>{getPriorityLabel(task.priority)}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-gray-600" onClick={() => router.push(`/tasks/${taskId}/edit`)}><Edit className="w-4 h-4 mr-2" />Sửa</Button>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteTask}><Trash2 className="w-4 h-4 mr-2" />Xóa</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 dafa-text border-b pb-2">Mô tả công việc</h3>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description || "Không có mô tả."}</div>
          </div>

          <div className="dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold dafa-text">Tài liệu đính kèm</h3>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Paperclip className="w-4 h-4 mr-2" />
                {uploading ? "Đang tải..." : "Đính kèm"}
              </Button>
            </div>
            {(!task.attachments || task.attachments.length === 0) ? (
              <p className="text-sm dafa-muted italic">Không có tài liệu đính kèm.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {task.attachments.map((a: any) => (
                  <div key={a.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center flex-1 min-w-0">
                      <Paperclip className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate text-dafa-text" title={a.fileName}>{a.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {a.uploadedBy?.fullName && <span className="text-gray-600">{a.uploadedBy.fullName} • </span>}
                          {Math.round((a.fileSize || 0) / 1024)} KB • {formatDateTime(a.createdAt)}
                        </p>
                      </div>
                    </a>
                    {currentUserId && a.uploadedById === currentUserId && (
                      <button
                        onClick={() => handleDeleteAttachment(a.id)}
                        className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Xóa file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{c.content}</p>
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
              {task.reportTo && (
                <div className="flex items-center gap-3 text-gray-600">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Báo cáo cho: <span className="font-medium text-amber-900">{task.reportTo.fullName}</span></span>
                </div>
              )}
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
            <h3 className="text-lg font-semibold mb-4 dafa-text border-b pb-2">Người nắm thông tin</h3>
            <div className="space-y-3">
              {task.followers?.map((f: any) => (
                <div key={f.id} className="flex items-center gap-3">
                  <Avatar src={f.user.avatarUrl} fallback={getInitials(f.user.fullName)} className="w-8 h-8" />
                  <span className="text-sm font-medium">{f.user.fullName}</span>
                </div>
              ))}
              {(!task.followers || task.followers.length === 0) && <span className="text-sm dafa-muted">Chưa có người nắm thông tin</span>}
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
