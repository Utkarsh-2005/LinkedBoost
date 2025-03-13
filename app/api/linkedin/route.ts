import { NextResponse } from "next/server";

const RAPIDAPI_HOST = "linkedin-data-api.p.rapidapi.com";

// Helper function that cycles through an array of keys
async function fetchWithFallback(url: string, options: RequestInit = {}) {
  const keys = [
    process.env.RAPIDAPI_KEY_PRIMARY,
    process.env.RAPIDAPI_KEY_SECONDARY,
    process.env.RAPIDAPI_KEY_TERTIARY,
    process.env.RAPIDAPI_KEY_QUATERNARY
  ].filter(Boolean);

  let lastError: Error | null = null;
  for (const key of keys) {
    // Set headers for each attempt
    options.headers = {
      ...options.headers,
      "x-rapidapi-key": key || "",
      "x-rapidapi-host": RAPIDAPI_HOST,
    };

    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    } else {
      // Log the failure and try the next key
      console.log(`Key failed with status ${response.status}`);
      const errorText = await response.text();
      lastError = new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
  }
  // If all keys fail, throw the last encountered error.
  if (lastError) {
    throw lastError;
  }
  throw new Error("No RapidAPI key provided");
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { profileUrl } = await req.json();

    if (!profileUrl) {
      return NextResponse.json({ error: "Missing profile URL" }, { status: 400 });
    }

    // Extract username from LinkedIn profile URL
    const regex = /^(https:\/\/(?:www\.)?linkedin\.com\/in\/[^\/\?]+)/;
    const short = profileUrl.match(regex);
    const cleanedUrl = short ? short[1] : null;
    // console.log("Cleaned URL:-", cleanedUrl);
    if (!cleanedUrl) {
      return NextResponse.json({ error: "Invalid LinkedIn profile URL" }, { status: 400 });
    }
    const match = profileUrl.match(/linkedin\.com\/in\/([^\/?]+)/);
    const username = match ? match[1] : null;

    if (!username) {
      return NextResponse.json({ error: "Invalid LinkedIn profile URL" }, { status: 400 });
    }

    // Fetch profile data
    const encodedUrl = encodeURIComponent(cleanedUrl);
    const profileUrlFull = `https://${RAPIDAPI_HOST}/get-profile-data-by-url?url=${encodedUrl}`;
    const profileResponse = await fetchWithFallback(profileUrlFull, {
      method: "GET",
    });
    const profileData = await profileResponse.json();

    // Fetch user's posts using the extracted username
    const postsUrlFull = `https://${RAPIDAPI_HOST}/get-profile-posts?username=${username}`;
    const postsResponse = await fetchWithFallback(postsUrlFull, {
      method: "GET",
    });
    const postsData = await postsResponse.json();

    return NextResponse.json({ profileData, postsData });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
