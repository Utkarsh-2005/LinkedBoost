import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOption } from '@/lib/authOption'
import {prisma} from "@/lib/prisma";

export async function GET(request: Request) {
  // Although GET requests are expected, Next.js automatically
  // handles non-GET methods, so this check is optional.
  if (request.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Use getServerSession to get the session on the server side
  const session = await getServerSession(authOption);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
