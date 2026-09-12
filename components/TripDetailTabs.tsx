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
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/trips" className="mb-4 inline-block text-sm text-zinc-500">
        ← 여행 목록
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{trip?.name ?? "불러오는 중..."}</h1>
      {trip && (
        <p className="mb-4 text-sm text-zinc-500">
          {trip.startDate.slice(0, 10)} ~ {trip.endDate.slice(0, 10)}
        </p>
      )}

      <div className="mb-4 flex gap-1 border-b">
        <button
          onClick={() => setTab("checklist")}
          data-testid="tab-checklist"
          className={`px-4 py-2 text-sm font-medium ${
            tab === "checklist"
              ? "border-b-2 border-black text-black"
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          준비물
        </button>
        <button
          onClick={() => setTab("itinerary")}
          data-testid="tab-itinerary"
          className={`px-4 py-2 text-sm font-medium ${
            tab === "itinerary"
              ? "border-b-2 border-black text-black"
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          일정
        </button>
      </div>

      {tab === "checklist" ? <TripBoard tripId={tripId} /> : <ItineraryView tripId={tripId} />}
    </main>
  );
}
