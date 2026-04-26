import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
  currentJobTitle: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        currentJobTitle: true,
        skills: true,
        createdAt: true,
        _count: { select: { posts: true, roadmaps: true } },
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const body = updateSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: userId },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        currentJobTitle: true,
        skills: true,
      },
    });
    return NextResponse.json({ user });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
