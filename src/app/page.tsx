"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (session) {
    return (
      <main>
        <h1>Concert Radar</h1>
        <p>Welcome, {session.user?.name}</p>
        <button onClick={() => signOut()}>Sign Out</button>
      </main>
    );
  }

  return (
    <main>
      <h1>Concert Radar</h1>
      <button onClick={() => signIn("spotify")}>Connect with Spotify</button>
    </main>
  );
}