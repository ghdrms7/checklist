import TripDetailTabs from "@/components/TripDetailTabs";

type Params = { params: Promise<{ id: string }> };

export default async function TripDetailPage({ params }: Params) {
  const { id } = await params;
  return <TripDetailTabs tripId={id} />;
}
