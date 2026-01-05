import { NextResponse } from "next/server";

// New RapidAPI host
const RAPIDAPI_HOST = "fresh-linkedin-profile-data.p.rapidapi.com";

// Simple delay utility to throttle sequential requests
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    // Prepare headers for each attempt
    options.headers = {
      ...options.headers,
      "x-rapidapi-key": key || "",
      "x-rapidapi-host": RAPIDAPI_HOST,
      Accept: "application/json",
    };
    // Avoid caching on server runtime
    options.cache = "no-store";

    // Try up to 2 attempts per key for transient errors
    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      } else {
        const errorText = await response.text();
        console.log(
          `[RapidAPI] Host=${RAPIDAPI_HOST} URL=${url} KeyAttempt=${attempt} Status=${response.status} Body=${errorText?.slice(0, 160)}`
        );
        lastError = new Error(`API request failed with status ${response.status}: ${errorText}`);
        // Backoff on rate limit or server errors, then retry once with same key
        if (response.status === 429 || response.status >= 500) {
          await sleep(900);
          continue;
        }
        // For non-retriable errors, break and try next key
        break;
      }
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

    // Extract canonical LinkedIn profile URL (no trailing paths/query)
    const regex = /^(https:\/\/(?:www\.)?linkedin\.com\/in\/[^\/\?]+)/;
    const short = profileUrl.match(regex);
    const cleanedUrl = short ? short[1] : null;
    // console.log("Cleaned URL:-", cleanedUrl);
    if (!cleanedUrl) {
      return NextResponse.json({ error: "Invalid LinkedIn profile URL" }, { status: 400 });
    }
    const rawUrl = cleanedUrl;

    // New API: Profile enrichment endpoint with optional includes disabled to minimize payload
    const profileParams = new URLSearchParams({
      linkedin_url: rawUrl,
      include_skills: "true",
      include_certifications: "false",
      include_publications: "false",
      include_honors: "false",
      include_volunteers: "false",
      include_projects: "false",
      include_patents: "false",
      include_courses: "false",
      include_organizations: "true",
      include_profile_status: "false",
      include_company_public_url: "false",
    });
    const profileUrlFull = `https://${RAPIDAPI_HOST}/enrich-lead?${profileParams.toString()}`;
    const profileResponse = await fetchWithFallback(profileUrlFull, { method: "GET" });
    const profileJson = await profileResponse.json();

    // Brief delay to avoid hitting rate limits on consecutive calls
    await sleep(1200);

    // New API: Posts endpoint uses linkedin_url and type=posts
    const postsParams = new URLSearchParams({ linkedin_url: rawUrl, type: "posts" });
    const postsUrlFull = `https://${RAPIDAPI_HOST}/get-profile-posts?${postsParams.toString()}`;
    const postsResponse = await fetchWithFallback(postsUrlFull, { method: "GET" });
    const postsJson = await postsResponse.json();

    // Normalize to the shape the UI expects
    const data = profileJson?.data || {};
    const location = data?.location || [data?.city, data?.country].filter(Boolean).join(", ") || "";
    const cleanProfileData = {
      profilePicture: data?.profile_image_url || null,
      firstName: data?.first_name || "",
      lastName: data?.last_name || "",
      headline: data?.headline || "",
      geo: location ? { full: location } : undefined,
      // Preserve original for downstream evaluation if needed
      _raw: profileJson,
    } as Record<string, unknown>;

    const postsData = Array.isArray(postsJson?.data) ? postsJson.data : [];

    return NextResponse.json({ profileData: cleanProfileData, postsData });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
