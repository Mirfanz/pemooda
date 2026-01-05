import {
  createToken,
  getCurrentUser,
  hasRole,
  setAuthCookie,
} from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { User } from "@/types";
import { NextResponse } from "next/server";

export async function POST() {
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

    if (hasRole(currentUser.role, Role.KETUA)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ketua tidak dapat keluar dari organisasi. Serahkan kepemimpinan terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: currentUser.id },
        data: { organizationId: null, role: null },
      }),
      prisma.organizationSummary.update({
        where: { organizationId: currentUser.organization.id },
        data: { totalMembers: { decrement: 1 } },
      }),
    ]);

    // Update JWT token
    const userForToken: User = {
      id: currentUser.id,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      isVerified: currentUser.isVerified,
      role: null,
      organization: null,
    };

    const newToken = await createToken(userForToken);
    await setAuthCookie(newToken);

    return NextResponse.json({
      success: true,
      message: "Berhasil keluar dari organisasi",
    });
  } catch (error) {
    console.error("Error leaving organization:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
