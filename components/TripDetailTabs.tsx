"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Trip } from "@/lib/types";
import ItineraryView from "./ItineraryView";
import TripBoard from "./TripBoard";

interface TripDetailTabsProps {
  tripId: string;
}

type Tab = "checklist" | "itinerary";

export default function TripDetailTabs({ tripId }: TripDetailTabsProps) {
  const { data: trip } = useSWR<Trip>(`/api/trips/${tripId}`, fetcher);
  const [tab, setTab] = useState<Tab>("checklist");

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/trips" className="mb-6 inline-block text-sm text-muted hover:text-ink">
        ← 여행 목록
      </Link>
      <h1 className="text-[22px] font-medium leading-tight text-ink">
        {trip?.name ?? "불러오는 중..."}
      </h1>
      {trip && (
        <p className="mt-1 mb-8 text-sm text-muted">
          {trip.startDate.slice(0, 10)} ~ {trip.endDate.slice(0, 10)}
        </p>
      )}

      <div className="mb-8 flex gap-6 border-b border-hairline">
        <button
          onClick={() => setTab("checklist")}
          data-testid="tab-checklist"
          className={`relative pb-3 text-base font-semibold ${
            tab === "checklist"
              ? "text-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-ink"
              : "text-muted hover:text-ink"
          }`}
        >
          준비물
        </button>
        <button
          onClick={() => setTab("itinerary")}
          data-testid="tab-itinerary"
          className={`relative pb-3 text-base font-semibold ${
            tab === "itinerary"
              ? "text-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-ink"
              : "text-muted hover:text-ink"
          }`}
        >
          일정
        </button>
      </div>

      {tab === "checklist" ? <TripBoard tripId={tripId} /> : <ItineraryView tripId={tripId} />}
    </main>
  );
}
