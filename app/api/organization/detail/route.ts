import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OrganizationFull } from "@/types";
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

    if (!currentUser.organization) {
      return NextResponse.json(
        { success: false, message: "Not joined organization yet" },
        { status: 404 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: currentUser.organization.id },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        tagline: true,
        createdAt: true,
        updatedAt: true,
        details: true,
        summary: {
          select: {
            organizationId: true,
            totalMembers: true,
            totalActivities: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 }
      );
    }
    const data: OrganizationFull = {
      id: organization.id,
      name: organization.name,
      imageUrl: organization.imageUrl,
      tagline: organization.tagline,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      summary: organization.summary,
      phone: organization.details?.phone || null,
      address: organization.details?.address || null,
      facebookUrl: organization.details?.facebookUrl || null,
      instagramUrl: organization.details?.instagramUrl || null,
      twitterUrl: organization.details?.twitterUrl || null,
      creator: organization.creator,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching organization detail:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
