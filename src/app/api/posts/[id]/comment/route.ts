import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ text: z.string().min(1).max(500) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = requireAuth(req);
    const { id: postId } = await params;
    const { text } = schema.parse(await req.json());

    const comment = await prisma.comment.create({
      data: { postId, userId, text },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
