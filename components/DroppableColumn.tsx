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
      className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-md border p-4 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-hairline-soft bg-surface-soft"
      }`}
    >
      <h3 className="mb-1 text-base font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}
