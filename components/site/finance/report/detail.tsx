"use client";

import { useReport, useDeleteFinanceReport } from "@/hooks/queries/finance";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Divider,
  addToast,
  Skeleton,
} from "@heroui/react";
import { FinanceReportType } from "@/lib/generated/prisma/enums";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  MoneyBag,
  TrashBinTrash,
  User,
  WalletMoney,
  Widget5,
} from "@solar-icons/react";
import Navbar from "../../navbar";
import { useRouter } from "next/navigation";
import axios from "axios";

interface FinanceReportDetailProps {
  reportId: string;
}

const FinanceReportDetail = ({ reportId }: FinanceReportDetailProps) => {
  const router = useRouter();
  const { data: report, isLoading, error } = useReport(reportId);
  const { mutate: deleteReport, isPending: isDeleting } =
    useDeleteFinanceReport();

  const canDelete = () => {
    if (!report) return false;
    return true;
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
      deleteReport(reportId, {
        onSuccess: () => {
          addToast({
            color: "success",
            title: "Laporan berhasil dihapus",
          });
          router.replace("/finance/report");
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Detail Laporan" />
        <div className="p-4">
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-danger">Error: {error.message}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const isIncome = report?.type === FinanceReportType.INCOME;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Detail Laporan" />
      <main className="p-4 space-y-4">
        {isLoading ? (
          <>
            <Card>
              <CardBody className="space-y-3">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardBody>
            </Card>
          </>
        ) : report ? (
          <>
            {/* Header Card */}
            <Card shadow="sm">
              <CardBody className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <Chip
                    size="md"
                    variant="flat"
                    color={isIncome ? "success" : "danger"}
                    startContent={
                      isIncome ? (
                        <MoneyBag weight="Broken" className="size-4" />
                      ) : (
                        <WalletMoney weight="Broken" className="size-4" />
                      )
                    }
                  >
                    {isIncome ? "Pemasukan" : "Pengeluaran"}
                  </Chip>

                  {canDelete() && (
                    <Button
                      color="danger"
                      variant="flat"
                      size="sm"
                      startContent={
                        <TrashBinTrash weight="Broken" className="size-4" />
                      }
                      onPress={handleDelete}
                      isLoading={isDeleting}
                    >
                      Hapus
                    </Button>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-bold mb-2">{report.title}</h1>
                  <div
                    className={`text-3xl font-bold ${
                      isIncome ? "text-success" : "text-danger"
                    }`}
                  >
                    {isIncome ? "+" : "-"} Rp{" "}
                    {report.amount.toLocaleString("id-ID")}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Description */}
            {report.description && (
              <Card shadow="sm">
                <CardBody className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2.5">
                    <Widget5
                      weight="Broken"
                      className="size-5 text-secondary"
                    />
                    Deskripsi
                  </h3>
                  <Divider />
                  <p className="text-muted-foreground">{report.description}</p>
                </CardBody>
              </Card>
            )}

            {/* Details */}
            <Card shadow="sm">
              <CardBody className="p-5 space-y-3">
                <h3 className="font-semibold flex items-center gap-2.5">
                  <Calendar weight="Broken" className="size-5 text-secondary" />
                  Informasi Detail
                </h3>
                <Divider />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Tanggal Laporan
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(report.reportDate),
                        "dd MMMM yyyy, HH:mm",
                        {
                          locale: id,
                        },
                      )}
                    </span>
                  </div>

                  <Divider />

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dibuat pada</span>
                    <span className="font-medium">
                      {format(
                        new Date(report.createdAt),
                        "dd MMMM yyyy, HH:mm",
                        {
                          locale: id,
                        },
                      )}
                    </span>
                  </div>

                  <Divider />

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Terakhir diupdate
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(report.updatedAt),
                        "dd MMMM yyyy, HH:mm",
                        {
                          locale: id,
                        },
                      )}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Creator */}
            <Card shadow="sm">
              <CardBody className="p-5 space-y-3">
                <h3 className="font-semibold flex items-center gap-2.5">
                  <User weight="Broken" className="size-5 text-secondary" />
                  Dibuat Oleh
                </h3>
                <Divider />
                <div className="flex items-center gap-3">
                  {report.creator.avatarUrl ? (
                    <img
                      src={report.creator.avatarUrl}
                      alt={report.creator.name}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User weight="Broken" className="size-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{report.creator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.organization.name}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Activity */}
            {report.activity && (
              <Card shadow="sm">
                <CardBody className="p-5 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2.5">
                    <Calendar
                      weight="Broken"
                      className="size-5 text-secondary"
                    />
                    Aktivitas Terkait
                  </h3>
                  <Divider />
                  <div>
                    <p className="font-medium mb-1">{report.activity.title}</p>
                    {report.activity.description && (
                      <p className="text-sm text-muted-foreground">
                        {report.activity.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {report.activity.location} •{" "}
                      {format(
                        new Date(report.activity.startDate),
                        "dd MMM yyyy",
                        {
                          locale: id,
                        },
                      )}
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-muted-foreground">Laporan tidak ditemukan</p>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FinanceReportDetail;
