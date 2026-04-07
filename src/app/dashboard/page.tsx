"use client"
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Concert } from "@/types/ticketmaster";

interface Artist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [concerts, setConcerts] = useState<Concert[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/spotify/top-artists");
        if (!response.ok) throw new Error("Failed to fetch top artists");
        const data = await response.json();
        setTopArtists(data.items);

        const concertNames = data.items.map((artist: Artist) => artist.name).join(",");
        const concertResponse = await fetch(`/api/concerts/search?artists=${concertNames}`);
        if (!concertResponse.ok) throw new Error("Failed to fetch concerts");
        const concertData = await concertResponse.json();
        setConcerts(concertData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#a1a1a1] text-lg">Please sign in to view your top artists.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#a1a1a1] text-lg">Loading your music data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-[#1DB954]">{session.user?.name}</span>
          </h1>
          <p className="text-[#a1a1a1] mt-1">Here are your top artists and upcoming concerts.</p>
        </div>
        <button
          onClick={() => signOut()}
          className="text-[#a1a1a1] hover:text-white transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Your Top Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topArtists.map((artist) => (
            <div
              key={artist.id}
              className="bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-colors"
            >
              {artist.images[0]?.url && (
                <img
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="w-full aspect-square object-cover rounded-full mb-3"
                />
              )}
              <p className="text-sm font-semibold text-center truncate">{artist.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Upcoming Concerts</h2>
        {concerts.length === 0 ? (
          <p className="text-[#a1a1a1]">No upcoming concerts found for your artists.</p>
        ) : (
          <div className="space-y-3">
            {concerts.map((concert) => (
              <a
                key={`${concert.name}-${concert.date}-${concert.city}`}
                href={concert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-colors"
              >
                <div>
                  <p className="font-semibold">{concert.name}</p>
                  <p className="text-[#a1a1a1] text-sm">{concert.venueName} · {concert.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#1DB954] font-medium">{concert.date}</p>
                  <p className="text-[#a1a1a1] text-xs">View Tickets →</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}