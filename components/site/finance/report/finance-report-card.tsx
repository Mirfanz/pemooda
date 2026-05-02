"use client";

import { FinanceReport } from "@/types";
import { Card, CardBody, Chip, addToast } from "@heroui/react";
import { FinanceReportType } from "@/lib/generated/prisma/enums";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoneyBag, TrashBinTrash, WalletMoney } from "@solar-icons/react";
import { useDeleteFinanceReport } from "@/hooks/queries/finance";
import axios from "axios";
import Link from "next/link";

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
      <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <CardBody className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Chip
                  size="sm"
                  variant="flat"
                  color={isIncome ? "success" : "danger"}
                  startContent={
                    isIncome ? (
                      <MoneyBag weight="Broken" className="size-3.5" />
                    ) : (
                      <WalletMoney weight="Broken" className="size-3.5" />
                    )
                  }
                >
                  {isIncome ? "Pemasukan" : "Pengeluaran"}
                </Chip>
              </div>

              <h3 className="font-semibold text-lg mb-1">{report.title}</h3>

              {report.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {report.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {format(new Date(report.reportDate), "dd MMM yyyy", {
                    locale: id,
                  })}
                </span>
                <span>•</span>
                <span>{report.creator.name}</span>
              </div>

              {report.activity && (
                <div className="mt-2">
                  <Chip size="sm" variant="bordered">
                    {report.activity.title}
                  </Chip>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div
                className={`text-xl font-bold ${
                  isIncome ? "text-success" : "text-danger"
                }`}
              >
                {isIncome ? "+" : "-"} Rp{" "}
                {report.amount.toLocaleString("id-ID")}
              </div>

              {canDelete() && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={isPending}
                  className="text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors disabled:opacity-50"
                  title="Hapus laporan"
                  aria-label="Hapus laporan"
                >
                  <TrashBinTrash weight="Broken" className="size-5" />
                </button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
};

export default FinanceReportCard;
