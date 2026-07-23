"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Calendar, Clock } from "lucide-react";
import { formatDate, getPriorityColor, getInitials } from "@/lib/utils";

export default function TaskCard({ task }: { task: any }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { ...task }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  const priorityColor = getPriorityColor(task.priority);
  
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={() => !isDragging && router.push(`/tasks/${task.id}`)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityColor.replace('bg-', 'bg-')}`}></div>
      
      <div className="pl-2">
        <h4 className="text-sm font-semibold dafa-text mb-2 line-clamp-2">{task.title}</h4>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((a: any) => (
              <Avatar key={a.id} src={a.user.avatarUrl} fallback={getInitials(a.user.fullName)} className="w-6 h-6 text-[10px] border border-white" />
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] border border-white text-gray-600">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
          
          {task.deadline && (
            <div className={`flex items-center text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(task.deadline)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
