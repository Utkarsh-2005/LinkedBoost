import { NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Store API key in environment variables
const RAPIDAPI_HOST = "linkedin-data-api.p.rapidapi.com";

export async function POST(req: Request) {
  try {
    const { profileUrl } = await req.json();

    if (!profileUrl) {
      return NextResponse.json({ error: "Missing profile URL" }, { status: 400 });
    }

    const encodedUrl = encodeURIComponent(profileUrl);
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/get-profile-data-by-url?url=${encodedUrl}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY || "",
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ profileData: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
