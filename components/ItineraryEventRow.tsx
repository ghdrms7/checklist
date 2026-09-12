"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { ItineraryEvent } from "@/lib/types";

interface ItineraryEventRowProps {
  event: ItineraryEvent;
  onSave: (event: ItineraryEvent, time: string, title: string, location: string) => void;
  onDelete: (event: ItineraryEvent) => void;
}

export default function ItineraryEventRow({ event, onSave, onDelete }: ItineraryEventRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event._id,
  });
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(event.time);
  const [title, setTitle] = useState(event.title);
  const [location, setLocation] = useState(event.location ?? "");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function saveEdit() {
    if (!time.trim() || !title.trim()) return;
    onSave(event, time.trim(), title.trim(), location.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2 border-b border-hairline-soft px-4 py-3 text-sm last:border-b-0">
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-20 rounded-sm border border-hairline px-2 py-1 focus:border-2 focus:border-ink focus:outline-none"
          autoFocus
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[8rem] flex-1 rounded-sm border border-hairline px-2 py-1 focus:border-2 focus:border-ink focus:outline-none"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소 (선택)"
          className="min-w-[8rem] flex-1 rounded-sm border border-hairline px-2 py-1 focus:border-2 focus:border-ink focus:outline-none"
        />
        <button onClick={saveEdit} className="text-sm font-medium text-primary hover:underline">
          저장
        </button>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-testid="itinerary-event"
      className="flex items-start gap-3 border-b border-hairline-soft bg-canvas px-4 py-3 text-sm last:border-b-0"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="드래그 핸들"
        className="mt-0.5 cursor-grab select-none text-muted-soft"
      >
        ⠿
      </button>
      <span className="w-14 shrink-0 font-medium text-muted">{event.time}</span>
      <button onClick={() => setEditing(true)} className="flex-1 text-left">
        <span className="text-base text-ink">{event.title}</span>
        {event.location && <div className="mt-0.5 text-sm text-muted">{event.location}</div>}
      </button>
      <button
        onClick={() => onDelete(event)}
        aria-label="일정 삭제"
        className="text-muted-soft hover:text-error"
      >
        ✕
      </button>
    </li>
  );
}
