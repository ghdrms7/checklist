"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
  return Array.from(groups.values())
    .map((group) => ({ ...group, events: [...group.events].sort((a, b) => a.order - b.order) }))
    .sort((a, b) => a.day - b.day);
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !events) return;

    const activeEvent = events.find((e) => e._id === active.id);
    const overEvent = events.find((e) => e._id === over.id);
    if (!activeEvent || !overEvent || activeEvent.day !== overEvent.day) return;

    const dayEvents = events
      .filter((e) => e.day === activeEvent.day)
      .sort((a, b) => a.order - b.order);
    const oldIndex = dayEvents.findIndex((e) => e._id === active.id);
    const newIndex = dayEvents.findIndex((e) => e._id === over.id);
    const reordered = arrayMove(dayEvents, oldIndex, newIndex).map((e, index) => ({
      ...e,
      order: index,
    }));

    const otherEvents = events.filter((e) => e.day !== activeEvent.day);
    const nextEvents = [...otherEvents, ...reordered];

    setError(null);
    mutate(
      async () => {
        await Promise.all(reordered.map((e) => updateItineraryEvent(e._id, { order: e.order })));
        return nextEvents;
      },
      {
        optimisticData: nextEvents,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    ).catch((err) => {
      setError(err instanceof Error ? err.message : "순서 변경에 실패했습니다");
    });
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-sm bg-error/10 px-3 py-2 text-sm font-medium text-error">
          {error}
        </div>
      )}

      {days.length === 0 && (
        <p className="mb-4 text-sm text-muted">등록된 일정이 없습니다. 아래에서 추가해보세요.</p>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        <div className="mb-6 flex flex-col gap-4">
          {days.map((group) => (
            <div
              key={group.day}
              data-testid={`itinerary-day-${group.day}`}
              className="rounded-md border border-hairline"
            >
              <h3 className="rounded-t-md border-b border-hairline bg-surface-soft px-4 py-3 text-base font-semibold text-ink">
                {group.dayLabel}
              </h3>
              <SortableContext
                items={group.events.map((event) => event._id)}
                strategy={verticalListSortingStrategy}
              >
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
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-md border border-hairline p-4">
        <h4 className="text-sm font-semibold text-ink">일정 추가</h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            min={1}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-16 rounded-sm border border-hairline px-2 py-1.5 text-sm focus:border-2 focus:border-ink focus:outline-none"
            aria-label="일차 번호"
          />
          <input
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
            placeholder="예: 1일차 (9/14 월)"
            className="min-w-[9rem] flex-1 rounded-sm border border-hairline px-2 py-1.5 text-sm focus:border-2 focus:border-ink focus:outline-none"
          />
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="시간 (예: 09:00)"
            className="w-28 rounded-sm border border-hairline px-2 py-1.5 text-sm focus:border-2 focus:border-ink focus:outline-none"
          />
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 내용"
          className="rounded-sm border border-hairline px-2 py-1.5 text-sm focus:border-2 focus:border-ink focus:outline-none"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소 (선택)"
          className="rounded-sm border border-hairline px-2 py-1.5 text-sm focus:border-2 focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="self-start rounded-sm bg-primary px-4 py-1.5 text-sm font-medium text-on-primary hover:bg-primary-active"
        >
          추가
        </button>
      </form>
    </div>
  );
}
