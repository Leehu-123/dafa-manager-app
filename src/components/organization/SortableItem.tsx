import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableItem({ id, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative flex items-center group ${className || ''}`}>
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-0 -ml-5 p-1 cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
