import { getCurrentUser, hasRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Activity } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ActivityType, Role } from "@/lib/generated/prisma/enums";
import { getActivityStatus } from "@/lib/activity";

const createActivitySchema = z.object({
  title: z
    .string()
    .min(1, "Activity title is required")
    .min(3, "Activity title must be at least 3 characters")
    .max(200, "Activity title must not exceed 200 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must not exceed 200 characters"),
  mapsUrl: z.url("Invalid maps URL").optional(),
  type: z.enum(ActivityType),
  isPublic: z.boolean().default(false),
  startDate: z.iso.datetime("Invalid start date format"),
  endDate: z.iso.datetime("Invalid end date format").optional(),
  notes: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const limit = 20;
  const page = req.nextUrl.searchParams.get("page");
  const isPublic = req.nextUrl.searchParams.get("public");
  const search = req.nextUrl.searchParams.get("search");

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

  const activitiesFromDB = await prisma.activity.findMany({
    where: {
      organizationId: currentUser.organization.id,
      title: search?.length
        ? { contains: search, mode: "insensitive" }
        : undefined,
      // isPublic: isPublic === "true" ? true : false,
    },
    take: limit,
    skip: page ? (parseInt(page) - 1) * limit : 0,
    orderBy: { createdAt: "desc" },
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

  const activities: Activity[] = activitiesFromDB.map((activity) => {
    return {
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
  });

  return NextResponse.json(
    {
      message: "Success get activities",
      data: activities,
      meta: {
        page: page ? parseInt(page) : 1,
        limit,
        total: activities.length,
        isLastPage: activities.length < limit ? true : false,
        search,
        isPublic: isPublic === "true" ? true : false,
      },
    },
    { status: 200 },
  );
}

export async function POST(req: NextRequest) {
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
          message: "Only leader or sekretaris can create activity",
        },
        { status: 403 },
      );

    const body = await req.json();
    const validation = createActivitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: z.flattenError(validation.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      location,
      mapsUrl,
      type,
      isPublic,
      startDate,
      endDate,
      notes,
    } = validation.data;

    // Validate end date is after start date if provided
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "End date must be after start date",
          errors: {
            endDate: ["End date must be after start date"],
          },
        },
        { status: 400 },
      );
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        location,
        mapsUrl,
        type,
        isPublic,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes,
        organizationId: currentUser.organization.id,
        createdBy: currentUser.id,
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
    await prisma.organizationSummary.update({
      where: { organizationId: currentUser.organization.id },
      data: {
        totalActivities: {
          increment: 1,
        },
      },
    });

    const activityResponse: Activity = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      status: "UPCOMING",
      type: activity.type,
      isPublic: activity.isPublic,
      startDate: activity.startDate,
      endDate: activity.endDate,
      location: activity.location,
      mapsUrl: activity.mapsUrl,
      notes: activity.notes,
      organization: activity.organization,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Activity created successfully",
        data: activityResponse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
