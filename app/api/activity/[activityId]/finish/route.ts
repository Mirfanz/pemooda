import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/enums";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> },
) {
  try {
    const { activityId } = await params;

    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user has permission (KETUA or SEKRETARIS)
    if (!hasRole(user.role, [Role.KETUA, Role.SEKRETARIS])) {
      return NextResponse.json(
        {
          success: false,
          message: "Only KETUA or SEKRETARIS can finish activities",
        },
        { status: 403 },
      );
    }

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        organization: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { success: false, message: "Activity not found" },
        { status: 404 },
      );
    }

    // Check if user belongs to the same organization
    if (activity.organizationId !== user.organization?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only finish activities in your organization",
        },
        { status: 403 },
      );
    }

    // Check if activity is already finished
    if (activity.endDate) {
      return NextResponse.json(
        { success: false, message: "Activity is already finished" },
        { status: 400 },
      );
    }

    // Check if activity has started
    const now = new Date();
    if (now < activity.startDate) {
      return NextResponse.json(
        { success: false, message: "Activity has not started yet" },
        { status: 400 },
      );
    }

    // Update activity with current time as endDate
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        endDate: now,
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

    return NextResponse.json({
      success: true,
      message: "Activity finished successfully",
      data: {
        activity: {
          id: updatedActivity.id,
          title: updatedActivity.title,
          description: updatedActivity.description,
          notes: updatedActivity.notes,
          type: updatedActivity.type,
          isPublic: updatedActivity.isPublic,
          startDate: updatedActivity.startDate,
          endDate: updatedActivity.endDate,
          location: updatedActivity.location,
          mapsUrl: updatedActivity.mapsUrl,
          createdAt: updatedActivity.createdAt,
          updatedAt: updatedActivity.updatedAt,
          organization: updatedActivity.organization,
        },
      },
    });
  } catch (error) {
    console.error("Error finishing activity:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
