import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function POST(req: NextRequest) {
  try {
    const { profileData, postsData } = await req.json();

    if (!profileData) {
      return NextResponse.json({ error: "No profile data provided" }, { status: 400 });
    }

    // Construct the prompt to ask for overall evaluation including posts
    const prompt = `
      Evaluate the following LinkedIn profile based on completeness, professionalism, and content engagement.
      Provide an overallScore (out of 100), an overallRemark, and sub-scores (out of 10) for:
      - Headline
      - Summary
      - Experience
      - Education
      - Other
      - Posts (based on engagement, clarity, and relevance)
      
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

      Profile Data: ${JSON.stringify(profileData)}
      Posts Data: ${JSON.stringify(postsData || [])}
    `;

    // Start chat session with model
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    // Debug: Log raw response
    console.log("Gemini Raw Response:", responseText);

    // Try parsing the response as JSON
    let evaluation;
    try {
      const match = responseText.match(/{.*}/s);
      if (!match) {
        throw new Error("Failed to find JSON in Gemini's response.");
      }
      evaluation = JSON.parse(match[0]);
    } catch (error) {
      console.error("JSON Parse Error:", error, "Response Text:", responseText);
      throw new Error("Failed to parse Gemini's response as JSON.");
    }

    return NextResponse.json({ evaluation }, { status: 200 });

  } catch (error) {
    console.error("Evaluation API Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
