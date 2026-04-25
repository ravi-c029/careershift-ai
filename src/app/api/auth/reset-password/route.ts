import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, hashPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    let userId: string;
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        resetToken: token,
        resetTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
