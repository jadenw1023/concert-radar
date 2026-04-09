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
        token.spotifyId = account.providerAccountId;
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