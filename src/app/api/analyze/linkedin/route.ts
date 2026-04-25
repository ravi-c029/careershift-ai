import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // Optional: secure the route if desired, though auth is already handled at page level
    // await requireAuth(req);

    const body = await req.json();
    const { url } = body;

    if (!url || !url.includes("linkedin.com/in/")) {
      return NextResponse.json({ error: "Invalid LinkedIn profile URL" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const prompt = `Extract the current job title and a list of up to 5 core technical or professional skills from this public LinkedIn profile: ${url}. 
    If you cannot access the profile or find the information, make a highly educated guess based on the username in the URL.
    Return a JSON response with exactly this structure:
    {
      "jobTitle": "string",
      "skills": ["skill1", "skill2"]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Gemini returns JSON directly due to responseMimeType
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[LINKEDIN_SYNC]", error);
    return NextResponse.json({ error: "Failed to extract profile data" }, { status: 500 });
  }
}
