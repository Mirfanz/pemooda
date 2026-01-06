import {
  createToken,
  getCurrentUser,
  hasRole,
  setAuthCookie,
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OrganizationUser } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    const members: OrganizationUser[] = await prisma.user.findMany({
      where: { organizationId: currentUser.organization.id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateRoleSchema = z.object({
  memberId: z.string().min(1, "Member ID diperlukan"),
  role: z.enum([
    "KETUA",
    "SEKRETARIS",
    "BENDAHARA",
    "ANGGOTA",
    "SENIOR",
    "PEMBINA",
  ]),
});

export async function PUT(req: NextRequest) {
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
          message: "Hanya ketua yang dapat mengubah role anggota",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = updateRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal" },
        { status: 400 }
      );
    }

    const { memberId, role } = validation.data;

    // Cannot change own role
    if (memberId === currentUser.id) {
      return NextResponse.json(
        { success: false, message: "Tidak dapat mengubah role sendiri" },
        { status: 400 }
      );
    }

    // Check if member exists in same organization
    const member = await prisma.user.findUnique({
      where: {
        id: memberId,
        organizationId: currentUser.organization.id,
      },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    // If changing to KETUA, demote current KETUA
    if (role === "KETUA") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: currentUser.id },
          data: { role: "ANGGOTA" },
          select: { id: true },
        }),
        prisma.user.update({
          where: { id: memberId },
          data: { role: "KETUA" },
          select: { id: true },
        }),
      ]);

      // Update current user's token
      const userForToken = {
        ...currentUser,
        role: "ANGGOTA" as const,
      };
      const newToken = await createToken(userForToken);
      await setAuthCookie(newToken);
    } else {
      await prisma.user.update({
        where: { id: memberId },
        data: { role },
        select: { id: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Role berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

const removeMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID diperlukan"),
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

    if (!hasRole(currentUser.role, "KETUA")) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya ketua yang dapat mengeluarkan anggota",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = removeMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal" },
        { status: 400 }
      );
    }

    const { memberId } = validation.data;

    if (memberId === currentUser.id) {
      return NextResponse.json(
        { success: false, message: "Tidak dapat mengeluarkan diri sendiri" },
        { status: 400 }
      );
    }

    const member = await prisma.user.findUnique({
      where: {
        id: memberId,
        organizationId: currentUser.organization.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: memberId },
        data: { organizationId: null, role: null },
        select: { id: true },
      }),
      prisma.organizationSummary.update({
        where: { organizationId: currentUser.organization.id },
        data: { totalMembers: { decrement: 1 } },
        select: { organizationId: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Anggota berhasil dikeluarkan",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
