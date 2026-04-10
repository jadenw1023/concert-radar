import { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-private user-read-email user-top-read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.spotifyId = account.providerAccountId;
      }

      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
        });

        const data = await response.json();

        token.accessToken = data.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
        if (data.refresh_token) {
          token.refreshToken = data.refresh_token;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.spotifyId = token.spotifyId as string;
      return session;
    },
    async signIn({ user, account }) {
      if (!account) return false;

      await prisma.user.upsert({
        where: { spotifyId: account.providerAccountId },
        create: {
          spotifyId: account.providerAccountId,
          name: user.name!,
          email: user.email!,
        },
        update: {
          name: user.name!,
          email: user.email!,
        },
      });
      return true;
    },
  },
};