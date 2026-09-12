"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

interface DroppableColumnProps {
  id: string;
  title: string;
  children: ReactNode;
}

export default function DroppableColumn({ id, title, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      data-testid={`column-${id}`}
      className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg border-2 p-3 transition-colors ${
        isOver ? "border-blue-400 bg-blue-50" : "border-dashed border-zinc-200"
      }`}
    >
      <h3 className="mb-1 font-semibold text-zinc-700">{title}</h3>
      {children}
    </div>
  );
}
