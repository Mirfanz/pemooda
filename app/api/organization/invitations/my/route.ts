import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OrganizationInvitation } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user email from database
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { email: true, organizationId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // If user already in organization, return empty
    if (user.organizationId) {
      return NextResponse.json({
        success: true,
        message: "Already in organization",
        data: [],
      });
    }

    const invitations: OrganizationInvitation[] =
      await prisma.invitation.findMany({
        where: {
          email: user.email,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          expiresAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              tagline: true,
            },
          },
          creator: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

    return NextResponse.json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Error fetching my invitations:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
