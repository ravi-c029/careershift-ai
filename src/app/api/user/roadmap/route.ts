import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req);
    const roadmaps = await prisma.roadmapResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ roadmaps });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
