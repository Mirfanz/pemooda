import {
  createToken,
  getCurrentUser,
  hasRole,
  setAuthCookie,
} from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { User } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .optional(),
  tagline: z.string().max(200, "Tagline maksimal 200 karakter").optional(),
  address: z.string().max(500, "Alamat maksimal 500 karakter").optional(),
  phone: z
    .string()
    .regex(/^08\d{9,13}$/, "Nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  instagramUrl: z.url("URL Instagram tidak valid").optional().or(z.literal("")),
  facebookUrl: z.url("URL Facebook tidak valid").optional().or(z.literal("")),
  twitterUrl: z.url("URL Twitter tidak valid").optional().or(z.literal("")),
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

    if (hasRole(currentUser.role, Role.KETUA)) {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya ketua yang dapat mengubah data organisasi",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = updateOrganizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: validation.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      name,
      tagline,
      address,
      phone,
      instagramUrl,
      facebookUrl,
      twitterUrl,
    } = validation.data;

    // Check if name already exists (if changing name)
    if (name) {
      const existingOrg = await prisma.organization.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: currentUser.organization.id },
        },
      });

      if (existingOrg) {
        return NextResponse.json(
          { success: false, message: "Nama organisasi sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.update({
        where: { id: currentUser.organization!.id },
        data: {
          ...(name && { name }),
          ...(tagline !== undefined && { tagline: tagline || null }),
        },
      });

      await tx.organizationDetail.upsert({
        where: { organizationId: currentUser.organization!.id },
        create: {
          organizationId: currentUser.organization!.id,
          address: address || null,
          phone: phone || null,
          instagramUrl: instagramUrl || null,
          facebookUrl: facebookUrl || null,
          twitterUrl: twitterUrl || null,
        },
        update: {
          ...(address !== undefined && { address: address || null }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(instagramUrl !== undefined && {
            instagramUrl: instagramUrl || null,
          }),
          ...(facebookUrl !== undefined && {
            facebookUrl: facebookUrl || null,
          }),
          ...(twitterUrl !== undefined && { twitterUrl: twitterUrl || null }),
        },
      });

      return organization;
    });

    // Update JWT token with new organization data
    const userForToken: User = {
      id: currentUser.id,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      isVerified: currentUser.isVerified,
      role: currentUser.role,
      organization: {
        id: result.id,
        name: result.name,
        imageUrl: result.imageUrl,
        tagline: result.tagline,
      },
    };

    const newToken = await createToken(userForToken);
    await setAuthCookie(newToken);

    return NextResponse.json({
      success: true,
      message: "Organisasi berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
