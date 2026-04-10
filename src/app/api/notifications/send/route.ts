import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

        const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response("Unauthorized", { status: 401 });
}

       const users = await prisma.user.findMany({
        where: {
            notificationEmail: {
                not: null,
            },
        },
    });

    for (const user of users) {
        const concerts = await prisma.concert.findMany({
            where: {
                topArtist: {
                    userId: user.spotifyId,
                },
            },
        });
        
        if (concerts.length === 0) continue;

        const concertList = concerts.map(c => `${c.eventName} on ${c.dateTime} in ${c.city}`).join("\n");

        try {
            await resend.emails.send({
  from: "Concert Radar <onboarding@resend.dev>",
  to: user.notificationEmail!,
  subject: "Upcoming Concerts for Your Favorite Artists",
  html: `
    <div style="background-color: #0a0a0a; color: #ededed; padding: 32px; font-family: Arial, sans-serif;">
      <h1 style="color: #1DB954; margin-bottom: 8px;">Concert Radar</h1>
      <p style="color: #a1a1a1; margin-bottom: 24px;">Here are upcoming concerts for your top artists:</p>
      ${concerts.map(c => `
        <div style="background-color: #181818; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <p style="font-size: 16px; font-weight: bold; margin: 0 0 4px 0;">${c.eventName}</p>
          <p style="color: #a1a1a1; font-size: 14px; margin: 0 0 4px 0;">${c.venueName} · ${c.city}</p>
          <p style="color: #1DB954; font-size: 14px; margin: 0 0 8px 0;">${c.dateTime}</p>
          <a href="${c.ticketUrl}" style="color: #1DB954; text-decoration: none; font-size: 14px;">View Tickets →</a>
        </div>
      `).join("")}
      <p style="color: #a1a1a1; font-size: 12px; margin-top: 24px;">You're receiving this because you opted in to Concert Radar notifications.</p>
    </div>
  `,
});
        } catch (error) {
            console.error(`Failed to send email to ${user.notificationEmail}:`, error);
        }
    }

    return new Response("Notifications sent");  
 }
        
