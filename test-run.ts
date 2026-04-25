import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AnalysisResult {
  displacementRisk: number;
  riskExplanation: string;
  safeAlternatives: Array<{
    title: string;
    match: number;
    description: string;
    avgSalary: string;
    growth: string;
    requiredSkills: string[];
  }>;
  skillGaps: Array<{
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    priority: "high" | "medium" | "low";
  }>;
  roadmap: Array<{
    week: number;
    title: string;
    focus: string;
    tasks: string[];
    resources: Array<{
      name: string;
      url: string;
      type: "course" | "article" | "video" | "project";
      free: boolean;
    }>;
  }>;
}

async function analyzeCareer(
  jobTitle: string,
  skills: string[]
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      
    },
  });

  const prompt = `You are an expert career counselor and AI labor market analyst. Analyze the following person's career situation and provide a comprehensive assessment.

Current Job Title: ${jobTitle}
Current Skills: ${skills.join(", ")}

Respond with ONLY valid JSON (no markdown, no code fences) with EXACTLY this structure:
{
  "displacementRisk": <number 0-100, how likely AI will displace this role>,
  "riskExplanation": "<2-3 sentence explanation of the risk score>",
  "safeAlternatives": [
    {
      "title": "<job title>",
      "match": <number 0-100, how well their current skills match>,
      "description": "<2 sentence description>",
      "avgSalary": "<salary range e.g. $65,000–$95,000>",
      "growth": "<growth % e.g. +18% by 2030>",
      "requiredSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
    }
  ],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "currentLevel": <0-100>,
      "requiredLevel": <0-100>,
      "priority": "<high|medium|low>"
    }
  ],
  "roadmap": [
    {
      "week": <1-12>,
      "title": "<week theme>",
      "focus": "<primary focus area>",
      "tasks": ["task1", "task2", "task3"],
      "resources": [
        {
          "name": "<resource name>",
          "url": "<real URL>",
          "type": "<course|article|video|project>",
          "free": <true|false>
        }
      ]
    }
  ]
}

Requirements:
- Provide exactly 5 safe career alternatives
- Provide 6-8 skill gaps (mix of high/medium/low priority)
- Provide exactly 12 weeks in the roadmap (covering months 1-3)
- Use real, working URLs for resources (Coursera, edX, YouTube, MDN, freeCodeCamp, etc.)
- Make all recommendations highly specific to their current role and skills
- Focus on careers where human skills (creativity, empathy, leadership) matter`;

  const result = await model.generateContent(prompt);
  console.log("Finish Reason:", result.response.candidates[0].finishReason); const text = result.response.text();

  // Extract JSON from response (handles any stray markdown fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  console.log('RAW TEXT:', text); if (!jsonMatch) throw new Error('No valid JSON in Gemini response');

  return JSON.parse(jsonMatch[0]) as AnalysisResult;
}

analyzeCareer('Software Developer', ['Python', 'SQL']).then(r => console.log('SUCCESS')).catch(e => console.error(e));




