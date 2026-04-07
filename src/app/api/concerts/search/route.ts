import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artists = searchParams.get("artists");

  if (!artists) {
    return NextResponse.json({ error: "Artists are required" }, { status: 400 });
  }
    const artistNames = artists.split(",")
  
    const promises = artistNames.map(artist => {
      const params = new URLSearchParams();
      params.append("apikey", process.env.TICKETMASTER_API_KEY!);
      params.append("keyword", artist);
      params.append("classificationName", "music");
      params.append("size", "5");

      return fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
      );
    });
    const results = await Promise.all(promises);

    const concerts = [];
    for (const response of results) {
      if (!response.ok) {
        continue; // Skip failed requests
      }
      const data = await response.json();
      const events = data._embedded?.events || [];
      concerts.push(...events.map((event: any) => ({
        name: event.name,
        date: event.dates.start.localDate,
        venueName: event._embedded.venues[0].name,
        city: event._embedded.venues[0].city.name,
        url: event.url,
      })));
    }

    return NextResponse.json(concerts);
}