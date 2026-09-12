"use client";

import { useState } from "react";
import useSWR from "swr";
import { createItineraryEvent, deleteItineraryEvent, fetcher, updateItineraryEvent } from "@/lib/api";
import type { ItineraryEvent } from "@/lib/types";
import ItineraryEventRow from "./ItineraryEventRow";

interface ItineraryViewProps {
  tripId: string;
}

interface DayGroup {
  day: number;
  dayLabel: string;
  events: ItineraryEvent[];
}

function groupByDay(events: ItineraryEvent[]): DayGroup[] {
  const groups = new Map<number, DayGroup>();
  for (const event of events) {
    const existing = groups.get(event.day);
    if (existing) {
      existing.events.push(event);
    } else {
      groups.set(event.day, { day: event.day, dayLabel: event.dayLabel, events: [event] });
    }
  }
  return Array.from(groups.values()).sort((a, b) => a.day - b.day);
}

export default function ItineraryView({ tripId }: ItineraryViewProps) {
  const { data: events, mutate } = useSWR<ItineraryEvent[]>(
    `/api/trips/${tripId}/itinerary`,
    fetcher
  );

  const [day, setDay] = useState(1);
  const [dayLabel, setDayLabel] = useState("1일차");
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const days = groupByDay(events ?? []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!time.trim() || !title.trim() || !dayLabel.trim()) return;
    setError(null);
    try {
      await createItineraryEvent(tripId, {
        day,
        dayLabel: dayLabel.trim(),
        time: time.trim(),
        title: title.trim(),
        location: location.trim() || undefined,
      });
      setTime("");
      setTitle("");
      setLocation("");
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정 등록에 실패했습니다");
    }
  }

  async function handleSave(event: ItineraryEvent, newTime: string, newTitle: string, newLocation: string) {
    setError(null);
    try {
      await updateItineraryEvent(event._id, {
        time: newTime,
        title: newTitle,
        location: newLocation || undefined,
      });
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정 수정에 실패했습니다");
    }
  }

  async function handleDelete(event: ItineraryEvent) {
    if (!confirm(`"${event.title}" 일정을 삭제할까요?`)) return;
    setError(null);
    try {
      await deleteItineraryEvent(event._id);
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정 삭제에 실패했습니다");
    }
  }

  return (
    <div>
      {error && <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {days.length === 0 && (
        <p className="mb-4 text-sm text-zinc-500">등록된 일정이 없습니다. 아래에서 추가해보세요.</p>
      )}

      <div className="mb-6 flex flex-col gap-4">
        {days.map((group) => (
          <div key={group.day} data-testid={`itinerary-day-${group.day}`} className="rounded border">
            <h3 className="border-b bg-zinc-50 px-3 py-2 font-semibold text-zinc-700">
              {group.dayLabel}
            </h3>
            <ul>
              {group.events.map((event) => (
                <ItineraryEventRow
                  key={event._id}
                  event={event}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded border p-3">
        <h4 className="text-sm font-semibold">일정 추가</h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            min={1}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-16 rounded border px-2 py-1.5 text-sm"
            aria-label="일차 번호"
          />
          <input
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
            placeholder="예: 1일차 (9/14 월)"
            className="min-w-[9rem] flex-1 rounded border px-2 py-1.5 text-sm"
          />
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="시간 (예: 09:00)"
            className="w-28 rounded border px-2 py-1.5 text-sm"
          />
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 내용"
          className="rounded border px-2 py-1.5 text-sm"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소 (선택)"
          className="rounded border px-2 py-1.5 text-sm"
        />
        <button type="submit" className="self-start rounded bg-black px-4 py-1.5 text-sm text-white">
          추가
        </button>
      </form>
    </div>
  );
}
