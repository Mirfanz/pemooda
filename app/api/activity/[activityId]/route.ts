import { getActivityStatus } from "@/lib/activity";
import { getCurrentUser } from "@/lib/auth";
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
    status: getActivityStatus(activity.startDate, activity.endDate),
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
