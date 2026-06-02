"use client";

import { FinanceReport } from "@/types";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  addToast,
} from "@heroui/react";
import { FinanceReportType } from "@/lib/generated/prisma/enums";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  CloseCircle,
  CourseDown,
  CourseUp,
  DocumentText,
  IconBase,
  Pen2,
  TrashBin2,
  User,
} from "@solar-icons/react";
import { useDeleteFinanceReport } from "@/hooks/queries/finance";
import axios from "axios";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import ActivityCard from "../../activity/activity-card";

interface FinanceReportDetailModalProps {
  report: FinanceReport | null;
  isOpen: boolean;
  onClose: () => void;
}

const FinanceReportDetailModal = ({
  report,
  isOpen,
  onClose,
}: FinanceReportDetailModalProps) => {
  const router = useRouter();
  const { mutate: deleteReport, isPending } = useDeleteFinanceReport();

  if (!report) return null;

  const isIncome = report.type === FinanceReportType.INCOME;

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      deleteReport(report.id, {
        onSuccess: () => {
          addToast({
            color: "success",
            title: "Laporan berhasil dihapus",
          });
          onClose();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // size="2xl"
      backdrop="blur"
      placement="center"
      scrollBehavior="inside"
      hideCloseButton
    >
      <ModalContent className="m-4">
        <ModalBody className="p-4">
          <Button
            size="lg"
            color={isIncome ? "success" : "danger"}
            variant="flat"
            fullWidth
            className="font-bold text-2xl h-auto p-4"
          >
            Rp {report.amount.toLocaleString("id-ID")}
          </Button>
          {/* <div className="flex gap-3"> */}
          {/* <Button
              size="md"
              color={isIncome ? "success" : "danger"}
              variant="flat"
              isIconOnly
            >
              <CourseUp className="size-5" />
            </Button> */}
          {/* </div> */}
          <h2 className="text-centers font-semibold text-medium px-3 border-x-2 border-default">
            {report.title}
          </h2>
          <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
            <h2 className="font-medium">Catatan:</h2>
            <p className="text-muted">
              {report.description ?? "Tidak ada catatan"}
            </p>
          </div>

          {/* Date */}
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                "p-3 rounded-xl",
                isIncome ? "bg-success/10" : "bg-danger/10",
              )}
            >
              <Calendar
                className={clsx(
                  "size-6",
                  isIncome ? "text-success" : "text-danger",
                )}
                weight="Bold"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                Tanggal {isIncome ? "Pemasukan" : "Pengeluaran"}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {format(new Date(report.reportDate), "EEEE, dd MMMM yyyy", {
                  locale: id,
                })}
              </p>
            </div>
          </div>

          {/* Activity */}
          {report.activity && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-2 px-1">
                Terkait Kegiatan
              </p>
              <Card
                isPressable
                as={Link}
                href={`/activity/${report.activity.id}`}
                className="border-2 border-secondary/20 hover:border-secondary transition-colors shadow-sm"
              >
                <CardBody className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-secondary/10 rounded-lg">
                      <DocumentText
                        className="size-5 text-secondary"
                        weight="Bold"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {report.activity.title}
                      </p>
                      {report.activity.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {report.activity.description}
                        </p>
                      )}
                    </div>
                    <CourseUp
                      className="size-5 text-secondary -rotate-45"
                      weight="Bold"
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* {report.activity && <ActivityCard activity={report.activity} />} */}

          <div className="mt-2">
            <div className="flex justify-between text-muted text-xs">
              <p>Tanggal Dibuat</p>
              <p>Dibuat Oleh</p>
            </div>
            <Divider className="my-1" />
            <div className="flex justify-between text-xs">
              <p className="">
                {format(new Date(report.createdAt), "dd MMM yyyy, HH:mm", {
                  locale: id,
                })}
              </p>
              <Link href={`/user/${report.creator.id}`} className="font-medium">
                {report.creator.name}
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex gap-2 pt-2">
            <Button
              color="danger"
              variant="flat"
              onPress={handleDelete}
              isLoading={isPending}
              startContent={!isPending && <TrashBin2 className="size-4" />}
              className="flex-1 font-semibold"
            >
              Hapus
            </Button>
            <Button
              color="default"
              variant="flat"
              onPress={onClose}
              className="flex-1 font-semibold"
            >
              Tutup
            </Button>
          </div> */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FinanceReportDetailModal;
