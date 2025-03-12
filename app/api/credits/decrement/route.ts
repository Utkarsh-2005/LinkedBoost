import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOption } from "@/app/api/auth/[...nextauth]/route";
import {prisma} from "@/lib/prisma";

export async function POST(request: Request) {
  // Get the session from the server side
  const session = await getServerSession(authOption);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Retrieve the user’s current credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If credits are above 0, decrement by 1; otherwise, leave them at 0.
    if (user.credits > 0) {
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: { credits: user.credits - 1 },
        select: { credits: true },
      });
      return NextResponse.json({ credits: updatedUser.credits });
    } else {
      return NextResponse.json({ credits: user.credits });
    }
  } catch (error) {
    console.error("Error decrementing credits:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
