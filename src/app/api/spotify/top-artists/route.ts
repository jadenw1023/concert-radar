import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=20&time_range=long_term", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    return new Response("Failed to fetch top artists", { status: response.status });
  }

  const data = await response.json();

// Delete old concerts for this user's artists
await prisma.concert.deleteMany({
  where: {
    topArtist: {
      userId: session.spotifyId,
    },
  },
});

// Delete old artists
await prisma.topArtist.deleteMany({
  where: { userId: session.spotifyId },
});

  // Save new artists
  for (const artist of data.items) {
    await prisma.topArtist.create({
      data: {
        spotifyArtistId: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url || "",
        userId: session.spotifyId,
      },
    });
  }

  return NextResponse.json(data);
}