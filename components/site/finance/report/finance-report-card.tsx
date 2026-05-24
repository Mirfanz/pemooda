"use client";

import { FinanceReport } from "@/types";
import { Button, Card, CardBody, addToast } from "@heroui/react";
import { FinanceReportType } from "@/lib/generated/prisma/enums";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CourseDown,
  CourseUp,
} from "@solar-icons/react";
import { useDeleteFinanceReport } from "@/hooks/queries/finance";
import axios from "axios";
import Link from "next/link";
import clsx from "clsx";

interface FinanceReportCardProps {
  report: FinanceReport;
}

const FinanceReportCard = ({ report }: FinanceReportCardProps) => {
  const { mutate: deleteReport, isPending } = useDeleteFinanceReport();

  const isIncome = report.type === FinanceReportType.INCOME;
  const canDelete = () => {
    return true;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(report.createdAt) > oneHourAgo;
  };

  const handleDelete = () => {
    if (!canDelete()) {
      addToast({
        color: "danger",
        title: "Tidak dapat menghapus laporan yang sudah lebih dari 1 jam",
      });
      return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      deleteReport(report.id, {
        onSuccess: () => {
          addToast({
            color: "success",
            title: "Laporan berhasil dihapus",
          });
        },
        onError: (error: unknown) => {
          if (axios.isAxiosError(error) && error.response?.data) {
            addToast({
              color: "danger",
              title: error.response.data.message || "Gagal menghapus laporan",
            });
          } else {
            addToast({
              color: "danger",
              title: "Terjadi kesalahan",
            });
          }
        },
      });
    }
  };
  return (
    <Link href={`/finance/report/${report.id}`}>
      <Card className="">
        <CardBody>
          <div className="flex gap-2">
            {isIncome ? (
              <Button isIconOnly size="sm" color="success" variant="flat">
                <CourseUp className="size-5" />
              </Button>
            ) : (
              <Button isIconOnly size="sm" color="danger" variant="flat">
                <CourseDown className="size-5" />
              </Button>
            )}
            <div className="w-full">
              <h3 className="text-sm line-clamp-2">{report.title}</h3>
              <div className="flex justify-between items-center">
                <small className="text-xs text-muted">
                  {format(new Date(report.reportDate), "EEEE, dd MMM yyyy", {
                    locale: id,
                  })}
                </small>
                <h3
                  className={clsx(
                    "font-medium text-nowrap",
                    isIncome ? "text-success" : "text-danger",
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {report.amount.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};

export default FinanceReportCard;
