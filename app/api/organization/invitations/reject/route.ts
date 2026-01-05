import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const rejectInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID diperlukan"),
});

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = rejectInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal" },
        { status: 400 }
      );
    }

    const { invitationId } = validation.data;

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        email: user.email,
      },
      select: { id: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Undangan tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({
      success: true,
      message: "Undangan berhasil ditolak",
    });
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
