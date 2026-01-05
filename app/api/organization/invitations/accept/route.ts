import { createToken, getCurrentUser, setAuthCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { User } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const acceptInvitationSchema = z.object({
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

    if (currentUser.organization) {
      return NextResponse.json(
        { success: false, message: "Anda sudah bergabung dengan organisasi" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validation = acceptInvitationSchema.safeParse(body);

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
        expiresAt: { gt: new Date() },
      },
      select: { organizationId: true, role: true },
    });

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          message: "Undangan tidak ditemukan atau sudah kadaluarsa",
        },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: currentUser.id },
        data: {
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          isVerified: true,
          role: true,
          organization: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              tagline: true,
            },
          },
        },
      });

      // Update organization summary
      await tx.organizationSummary.update({
        where: { organizationId: invitation.organizationId },
        data: { totalMembers: { increment: 1 } },
      });

      // Delete invitation
      await tx.invitation.delete({
        where: { id: invitationId },
      });

      return updatedUser;
    });

    // Create new JWT token
    const userForToken: User = {
      id: result.id,
      name: result.name,
      avatarUrl: result.avatarUrl,
      isVerified: result.isVerified,
      role: result.role,
      organization: result.organization
        ? {
            id: result.organization.id,
            name: result.organization.name,
            imageUrl: result.organization.imageUrl,
            tagline: result.organization.tagline,
          }
        : null,
    };

    const newToken = await createToken(userForToken);
    await setAuthCookie(newToken);

    return NextResponse.json({
      success: true,
      message: "Berhasil bergabung dengan organisasi",
      data: userForToken,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
