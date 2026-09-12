"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { createTrip, fetcher } from "@/lib/api";
import type { Trip } from "@/lib/types";

export default function TripsPage() {
  const { data: trips, isLoading, mutate } = useSWR<Trip[]>("/api/trips", fetcher);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;

    setSubmitting(true);
    setError(null);
    try {
      await createTrip({ name: name.trim(), startDate, endDate });
      setName("");
      setStartDate("");
      setEndDate("");
      mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "여행 생성에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">여행 준비물 체크리스트</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 rounded-lg border p-4">
        <h2 className="font-semibold">새 여행 만들기</h2>
        <input
          type="text"
          placeholder="여행 이름 (예: 오사카 여행)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border px-3 py-2"
          required
        />
        <div className="flex gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 rounded border px-3 py-2"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 rounded border px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "생성 중..." : "여행 생성"}
        </button>
      </form>

      <h2 className="mb-3 font-semibold">내 여행 목록</h2>
      {isLoading && <p className="text-sm text-zinc-500">불러오는 중...</p>}
      {!isLoading && trips?.length === 0 && (
        <p className="text-sm text-zinc-500">아직 등록된 여행이 없습니다.</p>
      )}
      <ul className="flex flex-col gap-2">
        {trips?.map((trip) => (
          <li key={trip._id}>
            <Link
              href={`/trips/${trip._id}`}
              className="block rounded border px-4 py-3 hover:bg-zinc-50"
            >
              <div className="font-medium">{trip.name}</div>
              <div className="text-sm text-zinc-500">
                {trip.startDate.slice(0, 10)} ~ {trip.endDate.slice(0, 10)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
