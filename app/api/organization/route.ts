import { createToken, getCurrentUser, setAuthCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      "Organization name can only contain letters, numbers, and spaces"
    )
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must not exceed 100 characters"),
  tagline: z
    .string()
    .max(200, "Tagline must not exceed 200 characters")
    .optional(),
  instagramUrl: z.url("Invalid Instagram URL").optional(),
  twitterUrl: z.url("Invalid Twitter URL").optional(),
  facebookUrl: z.url("Invalid Facebook URL").optional(),
  phone: z
    .string()
    .regex(
      /^08\d{11,13}$/,
      "Phone number must start with 08 and be 11-13 digits"
    )
    .optional(),
});

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

    return NextResponse.json(
      { success: true, organization: currentUser.organization },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!currentUser.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "User must be verified to create organization",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createOrganizationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, tagline, facebookUrl, instagramUrl, twitterUrl, phone } =
      validation.data;

    const userWithOrg = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { organizationId: true },
    });

    if (userWithOrg?.organizationId) {
      return NextResponse.json(
        { success: false, message: "You already have an organization" },
        { status: 400 }
      );
    }

    // Check if organization name already exists
    const existingOrgName = await prisma.organization.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existingOrgName) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization name already exists",
          errors: [
            {
              path: ["name"],
              message: "This organization name is already taken",
            },
          ],
        },
        { status: 400 }
      );
    }

    // Create organization with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name,
          tagline: tagline,
          imageUrl: null,
          createdBy: currentUser.id,
          details: {
            create: {
              instagramUrl,
              twitterUrl,
              facebookUrl,
              phone,
            },
          },
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: currentUser.id },
        data: {
          organizationId: organization.id,
          role: "KETUA",
        },
        include: {
          organization: true,
        },
      });

      // Initialize organization summary
      await tx.organizationSummary.create({
        data: {
          organizationId: organization.id,
          totalMembers: 1,
          totalActivities: 0,
        },
      });

      return { organization, updatedUser };
    });

    // Create new JWT token with updated user data
    const userForToken = {
      id: result.updatedUser.id,
      name: result.updatedUser.name,
      avatarUrl: result.updatedUser.avatarUrl,
      isVerified: result.updatedUser.isVerified,
      role: result.updatedUser.role,
      organization: result.updatedUser.organization
        ? {
            id: result.updatedUser.organization.id,
            name: result.updatedUser.organization.name,
            imageUrl: result.updatedUser.organization.imageUrl,
            tagline: result.updatedUser.organization.tagline,
          }
        : null,
    };

    const newToken = await createToken(userForToken);
    await setAuthCookie(newToken);

    return NextResponse.json(
      {
        success: true,
        message: "Organization created successfully",
        organization: result.organization,
        user: userForToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
