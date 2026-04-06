"use client"
import { useState, useEffect} from "react";
import { useSession } from "next-auth/react";

interface Artist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}

export default function Dashboard() {
    const { data: session } = useSession();
    const [topArtists, setTopArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopArtists() {
      try {
        const response = await fetch("/api/spotify/top-artists");
        if (!response.ok) {
          throw new Error("Failed to fetch top artists");
        }
        const data = await response.json();
        setTopArtists(data.items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopArtists();
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
  </div>
);}