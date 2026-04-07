"use client"
import { useState, useEffect} from "react";
import { useSession } from "next-auth/react";
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
        if (!response.ok) {
          throw new Error("Failed to fetch top artists");
        }
        const data = await response.json();
        setTopArtists(data.items);
        const concertNames = data.items.map((artist: Artist) => artist.name).join(",");
        const concertResponse = await fetch(`/api/concerts/search?artists=${concertNames}`);
        if (!concertResponse.ok) {
          throw new Error("Failed to fetch concerts");
        }
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
        return <p>Please sign in to view your top artists.</p>;
    }
    
  return (
  <div>
    <h1>Your Top Artists</h1>
    {loading ? (
      <p>Loading...</p>
    ) : (
      <ul>
        {topArtists.map((artist) => (
          <li key={artist.id}>
            {artist.name}
            {artist.images[0]?.url && (
              <img src={artist.images[0].url} alt={artist.name} />
            )}
          </li>
        ))}
      </ul>
    )}

    <h1>Upcoming Concerts</h1>
    <ul>
      {concerts.map((concert) => (
        <li key={`${concert.name}-${concert.date}-${concert.city}`}>
          <a href={concert.url} target="_blank" rel="noopener noreferrer">
            {concert.name}
          </a>
          <p>{concert.date}</p>
          <p>{concert.venueName}</p>
          <p>{concert.city}</p>
        </li>
      ))}
    </ul>
  </div>
);}