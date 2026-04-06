import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");

  if (!artist) {
    return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append("apikey", process.env.TICKETMASTER_API_KEY!);
  params.append("keyword", artist);
  params.append("classificationName", "music");
  params.append("size", "5");

  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch concerts" }, { status: response.status });
  }

const data = await response.json();

const concerts = data._embedded?.events?.map((event: any) => ({
  name: event.name,
  date: event.dates.start.localDate,
  venueName: event._embedded.venues[0].name,
  city: event._embedded.venues[0].city.name,
  url: event.url,
})) || [];

return NextResponse.json(concerts);
}