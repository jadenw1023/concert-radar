import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    const session = await getServerSession(authOptions);

    if (!session) {
    return new Response("Unauthorized", { status: 401 });
    }

    const { email } = await request.json();
    if (!email) {
        return new Response("Email is required", { status: 400 });
    }

    await prisma.user.update({
        where: { spotifyId: session.spotifyId },
        data: { notificationEmail: email },
    });

    return NextResponse.json({ message: "Email updated successfully" });
}