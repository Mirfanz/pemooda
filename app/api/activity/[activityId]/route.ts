import { getCurrentUser, hasRole } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { Activity } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  const currentUser = await getCurrentUser();
  const { activityId } = await params;

  if (!currentUser)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  if (!currentUser.organization)
    return NextResponse.json(
      { success: false, message: "Not join organization yet" },
      { status: 401 },
    );

  const activity = await prisma.activity.findUnique({
    where: {
      organizationId: currentUser.organization.id,
      id: activityId,
    },
    select: {
      id: true,
      title: true,
      isPublic: true,
      description: true,
      type: true,
      startDate: true,
      endDate: true,
      location: true,
      mapsUrl: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
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
  if (!activity)
    return NextResponse.json(
      { success: false, message: "Activity not found" },
      { status: 404 },
    );

  const data: Activity = {
    id: activity.id,
    title: activity.title,
    isPublic: activity.isPublic,
    description: activity.description,
    type: activity.type,
    startDate: activity.startDate,
    endDate: activity.endDate,
    location: activity.location,
    mapsUrl: activity.mapsUrl,
    notes: activity.notes,
    organization: activity.organization,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };

  return NextResponse.json({
    success: true,
    message: "Activity data",
    data,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    if (!currentUser.organization) {
      return NextResponse.json(
        { success: false, message: "Not joined organization yet" },
        { status: 403 },
      );
    }
    if (!hasRole(currentUser.role, [Role.KETUA, Role.SEKRETARIS]))
      return NextResponse.json(
        {
          success: false,
          message: "Hanya ketua dan sekretaris yang bisa menghapus aktivitas",
        },
        { status: 403 },
      );

    const { activityId } = await params;

    // Delete activity and update summary in transaction
    const activity = await prisma.$transaction(async (tx) => {
      if (!currentUser.organization)
        throw new Error("Organization ID is required");

      const deletedActivity = await tx.activity.delete({
        where: {
          id: activityId,
          organizationId: currentUser.organization.id,
        },
        include: {
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
        where: { organizationId: currentUser.organization.id },
        data: {
          totalActivities: { decrement: 1 },
        },
      });

      return deletedActivity;
    });

    const data: Activity = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      isPublic: activity.isPublic,
      startDate: activity.startDate,
      endDate: activity.endDate,
      location: activity.location,
      mapsUrl: activity.mapsUrl,
      notes: activity.notes,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      organization: activity.organization,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Activity deleted successfully",
        data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
