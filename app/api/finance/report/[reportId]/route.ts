import { getCurrentUser, hasRole } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { FinanceReport } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    const { reportId } = await params;

    if (!currentUser)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    if (!currentUser.organization)
      return NextResponse.json(
        { success: false, message: "Not joined organization yet" },
        { status: 403 },
      );

    const financeReport: FinanceReport | null =
      await prisma.financeReport.findUnique({
        where: {
          id: reportId,
          organizationId: currentUser.organization.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          type: true,
          reportDate: true,
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
          creator: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          activity: {
            select: {
              id: true,
              title: true,
              isPublic: true,
              description: true,
              type: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
        },
      });

    if (!financeReport)
      return NextResponse.json(
        { success: false, message: "Finance report not found" },
        { status: 404 },
      );

    return NextResponse.json(
      {
        success: true,
        message: "Finance report retrieved successfully",
        data: financeReport,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching finance report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    const { reportId } = await params;

    if (!currentUser)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    if (!currentUser.organization)
      return NextResponse.json(
        { success: false, message: "Not joined organization yet" },
        { status: 403 },
      );

    if (!hasRole(currentUser.role, Role.BENDAHARA))
      return NextResponse.json(
        {
          success: false,
          message: "Only bendahara can delete finance report",
        },
        { status: 403 },
      );

    const financeReport = await prisma.financeReport.findUnique({
      where: {
        id: reportId,
        organizationId: currentUser.organization.id,
      },
      select: {
        id: true,
        amount: true,
        type: true,
        createdAt: true,
        createdBy: true,
      },
    });

    if (!financeReport)
      return NextResponse.json(
        { success: false, message: "Finance report not found" },
        { status: 404 },
      );

    // Check if report was created within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (financeReport.createdAt < oneHourAgo)
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete finance report older than 1 hour",
        },
        { status: 403 },
      );

    // Delete report and update organization summary
    await prisma.$transaction(async (tx) => {
      await tx.financeReport.delete({
        where: { id: reportId },
      });

      await tx.organizationSummary.update({
        where: { organizationId: currentUser.organization!.id },
        data: {
          totalFinanceReport: { decrement: 1 },
          totalExpenses:
            financeReport.type === "EXPENSE"
              ? { decrement: financeReport.amount }
              : undefined,
          totalIncomes:
            financeReport.type === "INCOME"
              ? { decrement: financeReport.amount }
              : undefined,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Finance report deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting finance report:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
