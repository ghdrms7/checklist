"use client";

import { useState } from "react";
import type { ItineraryEvent } from "@/lib/types";

interface ItineraryEventRowProps {
  event: ItineraryEvent;
  onSave: (event: ItineraryEvent, time: string, title: string, location: string) => void;
  onDelete: (event: ItineraryEvent) => void;
}

export default function ItineraryEventRow({ event, onSave, onDelete }: ItineraryEventRowProps) {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(event.time);
  const [title, setTitle] = useState(event.title);
  const [location, setLocation] = useState(event.location ?? "");

  function saveEdit() {
    if (!time.trim() || !title.trim()) return;
    onSave(event, time.trim(), title.trim(), location.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0">
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-20 rounded border px-2 py-1"
          autoFocus
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[8rem] flex-1 rounded border px-2 py-1"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소 (선택)"
          className="min-w-[8rem] flex-1 rounded border px-2 py-1"
        />
        <button onClick={saveEdit} className="text-blue-600">
          저장
        </button>
      </li>
    );
  }

  return (
    <li
      data-testid="itinerary-event"
      className="flex items-start gap-3 border-b px-3 py-2 text-sm last:border-b-0"
    >
      <span className="w-14 shrink-0 font-medium text-zinc-500">{event.time}</span>
      <button onClick={() => setEditing(true)} className="flex-1 text-left">
        <span className="text-zinc-900">{event.title}</span>
        {event.location && <div className="text-xs text-zinc-400">{event.location}</div>}
      </button>
      <button
        onClick={() => onDelete(event)}
        aria-label="일정 삭제"
        className="text-zinc-400 hover:text-red-600"
      >
        ✕
      </button>
    </li>
  );
}
