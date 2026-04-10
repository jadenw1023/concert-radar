import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const artists = searchParams.get("artists");

  if (!artists) {
    return NextResponse.json({ error: "Artists are required" }, { status: 400 });
  }

  const artistNames = artists.split(",");

  const promises = artistNames.map((artist) => {
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

  for (let i = 0; i < artistNames.length; i++) {
    const artistName = artistNames[i];
    const response = results[i];

    if (!response.ok) continue;

    const dbArtist = await prisma.topArtist.findFirst({
      where: { name: artistName, userId: session.spotifyId },
    });

    if (!dbArtist) continue;

    // Delete old concerts for this artist
    await prisma.concert.deleteMany({
      where: { artistId: dbArtist.id },
    });

    const data = await response.json();
    const events = data._embedded?.events || [];

    for (const event of events) {
  try {
    await prisma.concert.create({
      data: {
        eventName: event.name,
        dateTime: event.dates.start.localDate,
        venueName: event._embedded.venues[0].name,
        city: event._embedded.venues[0].city.name,
        ticketUrl: event.url,
        artistId: dbArtist.id,
      },
    });
  } catch (error) {
    console.error("Failed to save concert:", error);
    continue;
  }

  concerts.push({
    name: event.name,
    date: event.dates.start.localDate,
    venueName: event._embedded.venues[0].name,
    city: event._embedded.venues[0].city.name,
    url: event.url,
  });
}
  }

  return NextResponse.json(concerts);
}