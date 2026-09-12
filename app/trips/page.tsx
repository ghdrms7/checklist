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
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-10 text-[28px] font-bold leading-[1.43] text-ink">
        여행 준비물 체크리스트
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-10 flex flex-col gap-3 rounded-md border border-hairline bg-canvas p-6"
      >
        <h2 className="text-base font-semibold text-ink">새 여행 만들기</h2>
        <input
          type="text"
          placeholder="여행 이름 (예: 오사카 여행)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-14 rounded-sm border border-hairline px-4 text-base text-ink placeholder:text-muted focus:border-2 focus:border-ink focus:outline-none"
          required
        />
        <div className="flex gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-14 flex-1 rounded-sm border border-hairline px-4 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-14 flex-1 rounded-sm border border-hairline px-4 text-base text-ink focus:border-2 focus:border-ink focus:outline-none"
            required
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="h-12 self-start rounded-sm bg-primary px-6 text-base font-medium text-on-primary transition-colors hover:bg-primary-active disabled:bg-primary-disabled"
        >
          {submitting ? "생성 중..." : "여행 생성"}
        </button>
      </form>

      <h2 className="mb-4 text-sm font-semibold text-muted">내 여행 목록</h2>
      {isLoading && <p className="text-sm text-muted">불러오는 중...</p>}
      {!isLoading && trips?.length === 0 && (
        <p className="text-sm text-muted">아직 등록된 여행이 없습니다.</p>
      )}
      <ul className="flex flex-col gap-4">
        {trips?.map((trip) => (
          <li key={trip._id}>
            <Link
              href={`/trips/${trip._id}`}
              className="block rounded-md border border-hairline bg-canvas p-5 transition-shadow hover:shadow-airbnb"
            >
              <div className="text-base font-semibold text-ink">{trip.name}</div>
              <div className="mt-1 text-sm text-muted">
                {trip.startDate.slice(0, 10)} ~ {trip.endDate.slice(0, 10)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
