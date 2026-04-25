import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = requireAuth(req);
    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.userId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Post deleted" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
