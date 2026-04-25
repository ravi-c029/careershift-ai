import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success (security: don't reveal email existence)
    if (!user) {
      return NextResponse.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const token = generateResetToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExp: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    sendPasswordResetEmail(email, user.name, token).catch(console.error);

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
