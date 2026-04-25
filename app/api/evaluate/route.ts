import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/astraClient";

const collectionName = process.env.ASTRA_DB_COLLECTION!; // Ensure this is set in your .env file.
const collection = db.collection(collectionName);

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY!;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

interface EvaluationRequestBody {
  profileData: Record<string, unknown>;
  postsData?: Record<string, unknown>[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { profileData, postsData }: EvaluationRequestBody = await req.json();
    if (!profileData) {
      return NextResponse.json({ error: "No profile data provided" }, { status: 400 });
    }

    // **Step 2: Retrieve Relevant Profiles from Astra DB (with timeout)**
    // Use a shortened version of the profile data to ensure input length is within limits.

    const chatSession = model.startChat({ generationConfig, history: [] });
    
    let rag = "";
    try {
      // Set a 10-second timeout for the entire RAG operation
      const ragPromise = (async () => {
        const fix_prompt = `Identify the main section needing improvement (Headline, Summary, Experience, Education, or Posts). Response: one word only.
Profile: ${JSON.stringify(profileData).slice(0, 500)}`;
        const result2 = await chatSession.sendMessage(fix_prompt);
        const issue_section = result2.response.text().trim();
        
        const searchResults = await collection.find(
          {},
          {
            sort: { $vectorize: issue_section },
            limit: 3,
            includeSimilarity: true,
            projection: { $vectorize: 1 } 
          }
        ).toArray();
        
        return JSON.stringify(searchResults.map((doc) => ({
          text: doc.$vectorize || "No text available",
          similarity: doc.$similarity || 0,
        })));
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("RAG operation timeout")), 10000)
      );

      rag = await Promise.race([ragPromise, timeoutPromise]);
    } catch (ragError) {
      console.warn("RAG lookup failed, continuing without context:", ragError);
      rag = "[]";
    }
    // **Step 3: Construct Enhanced Prompt**
    const prompt = `
      Evaluate the following LinkedIn profile based on completeness, professionalism, and engagement.
      Provide an overallScore (out of 100, with critical feedback), an overallRemark, and sub-scores (out of 10) for:
      - Headline
      - Summary
      - Experience
      - Education
      - Other
      - Posts (considering engagement, clarity, and relevance)
      
      Additionally, for the "Posts" section, include an array of the top 3 most engaging posts with a short description.
      Format the response as a valid JSON object with this structure:
       {
        "overallScore": number (Score out of 100 on the basis of the overall profile evaluation),
        "overallRemark": string,
        "Headline": { "text": string (reviews and fixes), "score": number },
        "Summary": { "text": string (reviews and fixes), "score": number },
        "Experience": { "text": string (reviews and fixes), "score": number },
        "Education": { "text": string (reviews and fixes), "score": number },
        "Other": { "text": string (reviews and fixes), "score": number },
        "Posts": {
          "text": string (reviews and fixes),
          "score": number,
          "topPosts": [
            "Your post about ...",
            "Your post about ...",
            "Your post about ..."
          ]
        }
      }

      Use this additional context in your "overallRemark":
      ${rag}

      Profile to Evaluate:
      ${JSON.stringify(profileData)}

      Posts Data:
      ${JSON.stringify(postsData || [])}
    `;

    // **Step 4: Generate Evaluation with Gemini (with timeout)**
    let responseText: string;
    try {
      const evalPromise = chatSession.sendMessage(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini evaluation timeout after 45 seconds")), 45000)
      );
      const result = await Promise.race([evalPromise, timeoutPromise]);
      responseText = result.response.text();
    } catch (timeoutError) {
      console.error("Gemini call timeout:", timeoutError);
      throw new Error("Profile evaluation took too long. Please try again.");
    }

    // **Step 5: Parse Response**
    let evaluation;
    try {
      const match = responseText.match(/{.*}/s);
      if (!match) throw new Error("Failed to find JSON in Gemini's response.");
      evaluation = JSON.parse(match[0]);
    } catch (error) {
      console.error("JSON Parse Error:", error, "Response Text:", responseText);
      throw new Error("Failed to parse evaluation response");
    }

    return NextResponse.json({ evaluation }, { status: 200 });
  } catch (error) {
    console.error("Evaluation API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
