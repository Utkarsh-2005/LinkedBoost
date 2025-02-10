import { NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Store API key in environment variables
const RAPIDAPI_HOST = "linkedin-data-api.p.rapidapi.com";

export async function POST(req: Request) {
  try {
    const { profileUrl } = await req.json();

    if (!profileUrl) {
      return NextResponse.json({ error: "Missing profile URL" }, { status: 400 });
    }

    // Extract username from LinkedIn profile URL
    const match = profileUrl.match(/linkedin\.com\/in\/([^\/?]+)/);
    const username = match ? match[1] : null;

    if (!username) {
      return NextResponse.json({ error: "Invalid LinkedIn profile URL" }, { status: 400 });
    }

    // Fetch profile data
    const encodedUrl = encodeURIComponent(profileUrl);
    const profileResponse = await fetch(
      `https://${RAPIDAPI_HOST}/get-profile-data-by-url?url=${encodedUrl}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY || "",
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API Error: ${profileResponse.statusText}`);
    }

    const profileData = await profileResponse.json();

    // Fetch user's posts using extracted username
    const postsResponse = await fetch(
      `https://${RAPIDAPI_HOST}/get-profile-posts?username=${username}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY || "",
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (!postsResponse.ok) {
      throw new Error(`LinkedIn Posts API Error: ${postsResponse.statusText}`);
    }

    const postsData = await postsResponse.json();

    return NextResponse.json({ profileData, postsData });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
