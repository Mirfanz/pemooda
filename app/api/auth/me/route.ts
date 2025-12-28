import { getCurrentUser, createToken, setAuthCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak terautentikasi",
        },
        { status: 401 }
      );
    }

    // Fetch data terbaru dari database
    const userFromDb = await prisma.user.findUnique({
      where: { id: currentUser.id },
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
            tagline: true,
          },
        },
      },
    });

    if (!userFromDb) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Prepare user payload
    const userPayload = {
      id: userFromDb.id,
      name: userFromDb.name,
      avatarUrl: userFromDb.avatarUrl,
      isVerified: userFromDb.isVerified,
      role: userFromDb.role,
      organization: userFromDb.organization,
    };

    // Cek apakah ada perubahan data (terutama isVerified)
    const hasChanges =
      currentUser.isVerified !== userFromDb.isVerified ||
      currentUser.name !== userFromDb.name ||
      currentUser.avatarUrl !== userFromDb.avatarUrl ||
      currentUser.role !== userFromDb.role ||
      currentUser.organization?.id !== userFromDb.organization?.id;

    // Jika ada perubahan, regenerate JWT token
    if (hasChanges) {
      const newToken = await createToken(userPayload);
      await setAuthCookie(newToken);
    }

    return NextResponse.json(
      {
        success: true,
        data: { user: userPayload },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat get user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan",
      },
      { status: 500 }
    );
  }
}
