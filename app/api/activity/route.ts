import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Activity } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const limit = 20;
  const page = req.nextUrl.searchParams.get("page");
  const isPublic = req.nextUrl.searchParams.get("public");
  const search = req.nextUrl.searchParams.get("search");

  if (!currentUser)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  if (!currentUser.organization)
    return NextResponse.json(
      { success: false, message: "Not join organization yet" },
      { status: 401 }
    );

  const activitiesFromDB = await prisma.activity.findMany({
    where: {
      organizationId: currentUser.organization.id,
      title: search?.length
        ? { contains: search, mode: "insensitive" }
        : undefined,
      isPublic: isPublic === "true" ? true : false,
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
      status: "ongoing",
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
    { status: 200 }
  );
}
