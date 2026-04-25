import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { analyzeCareer } from "@/lib/openai";
import { z } from "zod";

const analyzeSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  targetRole: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = analyzeSchema.parse(await req.json());
    const { jobTitle, skills, targetRole } = body;

    // Save skills to user profile
    await prisma.user.update({
      where: { id: userId },
      data: { currentJobTitle: jobTitle, skills },
    });

    // Call OpenAI
    const result = await analyzeCareer(jobTitle, skills, targetRole);

    // Persist roadmap result
    const roadmap = await prisma.roadmapResult.create({
      data: {
        userId,
        jobTitle,
        inputSkills: skills,
        displacementRisk: result.displacementRisk,
        safeAlternatives: result.safeAlternatives,
        roadmapData: {
          skillGaps: result.skillGaps,
          roadmap: result.roadmap,
          riskExplanation: result.riskExplanation,
        },
      },
    });

    return NextResponse.json({ ...result, roadmapId: roadmap.id });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    // Surface OpenAI-specific errors clearly
    const openAIError = error as { status?: number; error?: { code?: string; message?: string } };
    if (openAIError?.error?.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "OpenAI quota exceeded. Please add billing credits at platform.openai.com/settings/billing" },
        { status: 402 }
      );
    }
    if (openAIError?.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env.local" },
        { status: 401 }
      );
    }

    console.error("[ANALYZE]", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
