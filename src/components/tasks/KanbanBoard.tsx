"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/Button";
import { Plus, LayoutList, LayoutGrid } from "lucide-react";
import TaskCard from "./TaskCard";

const columns = [
  { id: "TODO", title: "Chưa bắt đầu", color: "bg-slate-100", headerColor: "border-slate-400" },
  { id: "IN_PROGRESS", title: "Đang thực hiện", color: "bg-blue-50", headerColor: "border-blue-400" },
  { id: "REVIEW", title: "Chờ duyệt", color: "bg-amber-50", headerColor: "border-amber-400" },
  { id: "DONE", title: "Hoàn thành", color: "bg-green-50", headerColor: "border-green-400" },
];

export default function KanbanBoard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Failed to update status", error);
      fetchTasks(); // Revert on failure
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dafa-text">Bảng Kanban</h1>
        <div className="flex gap-4 items-center">
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <Button variant="ghost" className="rounded-none px-2 hover:bg-gray-100" onClick={() => router.push("/tasks")}>
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="rounded-none px-2 bg-gray-100" onClick={() => router.push("/tasks/kanban")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => router.push("/tasks/new")} className="dafa-accent bg-[#A14F39] text-white hover:bg-[#8a3f2d]">
            <Plus className="w-4 h-4 mr-2" /> Thêm công việc
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`flex-1 min-w-[300px] flex flex-col rounded-lg ${col.color}`}>
                <div className={`p-3 font-semibold dafa-text border-b-2 ${col.headerColor} flex justify-between items-center`}>
                  <span>{col.title}</span>
                  <span className="bg-white text-xs px-2 py-1 rounded-full text-gray-500 font-normal">{colTasks.length}</span>
                </div>
                <div className="p-2 flex-1 overflow-y-auto space-y-2" id={col.id}>
                  {/* For simpler implementation without complex SortableContext logic for nested drops, 
                      we use basic drag and drop targets. In a real complex DndKit we'd map SortableContext */}
                  {colTasks.map(task => (
                     <TaskCard key={task.id} task={task} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                      Kéo thả vào đây
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </DndContext>
      </div>
    </div>
  );
}
