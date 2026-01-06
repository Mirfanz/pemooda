import { getCurrentUser, hasRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { OrganizationInvitation } from "@/types";
import { Role } from "@/lib/generated/prisma/enums";

const createInvitationSchema = z.object({
  email: z.email("Email tidak valid"),
  role: z
    .enum(["SEKRETARIS", "BENDAHARA", "ANGGOTA", "SENIOR", "PEMBINA"])
    .default("ANGGOTA"),
});

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!currentUser.organization) {
      return NextResponse.json(
        { success: false, message: "Anda belum bergabung dengan organisasi" },
        { status: 404 }
      );
    }

    const invitations: OrganizationInvitation[] =
      await prisma.invitation.findMany({
        where: {
          organizationId: currentUser.organization.id,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          expiresAt: true,
          organization: {
            select: { id: true, name: true, imageUrl: true, tagline: true },
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
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!currentUser.organization) {
      return NextResponse.json(
        { success: false, message: "Anda belum bergabung dengan organisasi" },
        { status: 404 }
      );
    }

    if (!hasRole(currentUser.role, "KETUA")) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya ketua yang dapat mengundang anggota",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: z.flattenError(validation.error).fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    // Check if user already in organization
    const existingMember = await prisma.user.findFirst({
      where: {
        email,
        organizationId: currentUser.organization.id,
      },
      select: { id: true },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, message: "User sudah menjadi anggota organisasi" },
        { status: 400 }
      );
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        organizationId: currentUser.organization.id,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, message: "Undangan untuk email ini sudah ada" },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { organizationId: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User dengan email ini tidak ditemukan" },
        { status: 404 }
      );
    }

    if (targetUser.organizationId) {
      return NextResponse.json(
        {
          success: false,
          message: "User sudah bergabung dengan organisasi lain",
        },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation: OrganizationInvitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        organizationId: currentUser.organization.id,
        createdBy: currentUser.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
        organization: {
          select: { id: true, name: true, imageUrl: true, tagline: true },
        },
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Undangan berhasil dikirim",
      data: invitation,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

const cancelInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID diperlukan"),
});

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!currentUser.organization) {
      return NextResponse.json(
        { success: false, message: "Anda belum bergabung dengan organisasi" },
        { status: 404 }
      );
    }

    if (!hasRole(currentUser.role, Role.KETUA)) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya ketua yang dapat membatalkan undangan",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = cancelInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: z.flattenError(validation.error).fieldErrors,
        },
        { status: 400 }
      );
    }

    const { invitationId } = validation.data;

    const invitation = await prisma.invitation.findUnique({
      where: {
        id: invitationId,
        organizationId: currentUser.organization.id,
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
      message: "Undangan berhasil dibatalkan",
    });
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
