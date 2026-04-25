import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const saveSchema = z.object({
  jobId: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  location: z.string().optional(),
  url: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const saved = await prisma.savedJob.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
    });
    return NextResponse.json({ jobs: saved });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const data = saveSchema.parse(await req.json());

    const saved = await prisma.savedJob.upsert({
      where: { userId_jobId: { userId, jobId: data.jobId } },
      update: {},
      create: { userId, ...data, location: data.location || "" },
    });

    return NextResponse.json({ saved }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
