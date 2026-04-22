"use client";

import {
  useActivity,
  useDeleteActivity,
  useFinishActivity,
} from "@/hooks/queries/activity";
import { useAttendances } from "@/hooks/queries/attendance";
import Navbar from "../navbar";
import {
  Card,
  CardBody,
  Chip,
  Skeleton,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { activityTypeEnum, timeStatusEnum } from "@/config/enums";
import * as fns from "date-fns";
import { id } from "date-fns/locale";
import {
  Share,
  PenNewSquare,
  TrashBinTrash,
  CheckCircle,
  MenuDots,
  CalendarMark,
  MapPointWave,
  SquareTopDown,
  DocumentAdd,
  ClockCircle,
} from "@solar-icons/react";
import Link from "next/link";
import { displayIntervalDate, getTimeStatus } from "@/lib/utils";
import Countdown from "./countdown";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/lib/generated/prisma/enums";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { TimeStatus } from "@/types";
import Attendances from "./attendances";

type Props = {
  activityId: string;
};

const Detail = ({ activityId }: Props) => {
  const { isLoading, data: activity } = useActivity(activityId);
  const { data: attendances } = useAttendances(activityId);
  const auth = useAuth();
  const router = useRouter();
  const deleteActivity = useDeleteActivity();
  const finishActivity = useFinishActivity();

  const activityStatus: TimeStatus | undefined = activity
    ? getTimeStatus(activity.startDate, activity.endDate)
    : undefined;

  const activityColor = activityStatus
    ? timeStatusEnum[activityStatus].color
    : "default";

  const handleCountdownEnded = () => {
    // Refresh activity data when countdown ends
  };

  const handleShare = async () => {
    const shareData = {
      title: activity?.title || "Kegiatan",
      text: `${activity?.title}\n${activity?.description || ""}\n\nLokasi: ${activity?.location}\nTanggal: ${fns.format(new Date(activity?.startDate || ""), "dd MMMM yyyy, HH:mm", { locale: id })} WIB`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`,
        );
        Swal.fire({
          icon: "success",
          title: "Link Disalin!",
          text: "Link kegiatan telah disalin ke clipboard",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error sharing:", err);
      }
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Kegiatan?",
      text: "Kegiatan yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteActivity.mutateAsync(activityId);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Kegiatan berhasil dihapus",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/activity");
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Terjadi kesalahan saat menghapus kegiatan",
        });
      }
    }
  };

  const handleFinishActivity = async () => {
    const result = await Swal.fire({
      title: "Selesaikan Kegiatan?",
      text: "Kegiatan akan ditandai sebagai selesai",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Selesaikan!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await finishActivity.mutateAsync(activityId);
        // Status will be automatically refreshed when activity data is refetched
        Swal.fire({
          icon: "success",
          title: "Selesai!",
          text: "Kegiatan berhasil diselesaikan",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Terjadi kesalahan";
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errorMessage,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Detail Kegiatan" />
        <main className="p-4 space-y-4">
          <Skeleton className="rounded-lg h-48" />
          <Skeleton className="rounded-lg h-32" />
          <Skeleton className="rounded-lg h-64" />
        </main>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Detail Kegiatan" />
        <main className="p-4">
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-default-500">Kegiatan tidak ditemukan</p>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  const ActivityIcon = activityTypeEnum[activity.type].icon;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar
        title="Detail Kegiatan"
        endContent={
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                className="text-inherit"
              >
                <MenuDots weight="Bold" className="size-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="flat">
              <DropdownItem
                key="share"
                startContent={<Share weight="Linear" className="size-4" />}
                onPress={handleShare}
              >
                Share
              </DropdownItem>
              {auth.hasRole([Role.KETUA, Role.SEKRETARIS]) ? (
                <>
                  <DropdownItem
                    key="edit"
                    startContent={
                      <PenNewSquare weight="Broken" className="size-4" />
                    }
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    startContent={
                      <TrashBinTrash weight="Broken" className="size-4" />
                    }
                    className="text-danger"
                    color="danger"
                    onPress={handleDelete}
                  >
                    Delete
                  </DropdownItem>
                </>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        }
      />

      <main className="space-y-4">
        {/* Header */}
        <section className="px-4 mt-4">
          <div className="">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Chip size="sm" color={activityColor} variant="flat" radius="sm">
                {activityStatus === "ongoing"
                  ? timeStatusEnum.ongoing.label
                  : displayIntervalDate(activity.startDate)}
              </Chip>
              <Chip
                size="sm"
                radius="sm"
                variant="flat"
                startContent={<ActivityIcon className="size-3 ms-1 me-0.5" />}
              >
                {activityTypeEnum[activity.type].label}
              </Chip>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              {activity.title}
            </h1>
            <p className="text-default-600 text-sm whitespace-pre-wrap">
              {activity.description}
            </p>
          </div>

          <div className="space-y-3 my-4">
            <div className="flex items-start gap-3">
              <CalendarMark
                weight="Broken"
                className="size-5 ms-1 text-primary shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {fns.format(
                    new Date(activity.startDate),
                    "EEEE, dd MMMM yyyy",
                    { locale: id },
                  )}
                </p>
                <p className="text-xs text-default-500">
                  {fns.format(new Date(activity.startDate), "HH:mm", {
                    locale: id,
                  })}{" "}
                  WIB
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-3 items-start">
              <MapPointWave
                weight="Broken"
                className="size-5 ms-1 text-primary shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {activity.location}
                </p>
                {activity.mapsUrl ? (
                  <Link href={activity.mapsUrl} target="_blank">
                    <p className="flex items-center gap-1 text-xs text-primary">
                      Lihat Maps
                      <SquareTopDown weight="Broken" className="size-3" />
                    </p>
                  </Link>
                ) : (
                  <p className="text-xs text-default-500">
                    Maps tidak tersedia
                  </p>
                )}
              </div>

              {/* <div className="flex w-full aspect-2/1 rounded-2xl"> */}
              {/* <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253851.81649450268!2d106.807296!3d-6.2062592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5ce68b5e01d%3A0xcafaf042d5840c6c!2sMasjid%20Istiqlal!5e0!3m2!1sid!2sid!4v1771696534897!5m2!1sid!2sid"
                  // style="border:0;"
                  allowFullScreen
                  loading="lazy"
                  className="flex aspect-2/1 border border-gray-300 shadow-mds rounded-2xl"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe> */}
              {/* </div> */}
              {/* <Skeleton className="flex w-full aspect-2/1 rounded-2xl" /> */}
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="px-4">
          <Card className="p-4 gap-3 shadow-md" fullWidth>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <DocumentAdd
                  weight="BoldDuotone"
                  className="w-5 h-5 text-primary"
                />
                <h2 className="text-lg font-bold">Catatan</h2>
                <span className="text-muted">({activity.notes.length})</span>
              </div>
              <Button size="sm" variant="flat" color="primary">
                <PenNewSquare weight="Broken" className="size-3" />
                Edit
              </Button>
            </div>
            {activity.notes.length ? (
              <ul className="space-y-1 list-item">
                {activity.notes.map((note, index) => (
                  <li
                    key={index}
                    className="text-sm text-default-600 flex items-center gap-2"
                  >
                    <span className="text-primary ms-2">•</span>
                    <span className="flex-1">{note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted text-sm p-2">
                ~ Tidak ada catatan ~
              </p>
            )}
          </Card>
        </section>

        {activityStatus === "upcoming" && (
          <section className="px-4">
            <Card className="bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800 shadow-lg">
              <CardBody className="p-4">
                <div className="flex flex-col justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* <div className="absolute inset-0 bg-primary rounded-full animate-bounce opacity-75" /> */}
                      <div className="relative bg-primary rounded-full p-2">
                        <ClockCircle
                          weight="Broken"
                          className="size-5 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary-700 dark:text-primary-400">
                        Segera Dimulai
                      </h3>
                      <p className="text-xs text-primary-600 dark:text-primary-500">
                        Hitung mundur acara dimulai.
                      </p>
                    </div>
                  </div>
                  <Countdown
                    targetDate={activity.startDate}
                    onEnded={handleCountdownEnded}
                    className="text-primary"
                  />
                </div>
              </CardBody>
            </Card>
          </section>
        )}

        {/* Ongoing */}
        {activityStatus === "ongoing" &&
          (activity.endDate ? (
            <section className="px-4">
              <Card className="bg-linear-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-2 border-success-200 dark:border-success-800 shadow-lg">
                <CardBody className="p-4">
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-75" />
                        <div className="relative bg-success rounded-full p-2">
                          <ClockCircle
                            weight="Broken"
                            className="size-5 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-success-700 dark:text-success-400">
                          Sedang Berlangsung
                        </h3>
                        <p className="text-xs text-success-600 dark:text-success-500">
                          Akan selesai pada{" "}
                          {fns.format(
                            new Date(activity.endDate),
                            "dd MMMM yyyy, HH:mm",
                            {
                              locale: id,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <Countdown
                      targetDate={activity.endDate}
                      onEnded={handleCountdownEnded}
                      className="text-success"
                    />
                  </div>
                </CardBody>
              </Card>
            </section>
          ) : (
            <section className="px-4">
              <Card className="bg-linear-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-2 border-success-200 dark:border-success-800 shadow-lg">
                <CardBody className="p-4">
                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-75" />
                        <div className="relative bg-success rounded-full p-2">
                          <ClockCircle
                            weight="Broken"
                            className="size-5 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-success-700 dark:text-success-400">
                          Sedang Berlangsung
                        </h3>
                        <p className="text-xs text-success-600 dark:text-success-500">
                          Jangan lupa absen!
                        </p>
                      </div>
                    </div>
                    {auth.hasRole([Role.KETUA, Role.SEKRETARIS]) && (
                      <Button
                        size="sm"
                        color="success"
                        // variant="flat"
                        startContent={
                          <CheckCircle weight="Broken" className="size-4" />
                        }
                        onPress={handleFinishActivity}
                      >
                        Finish Activity
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            </section>
          ))}

        {/* {activityStatus === "ongoing" && (
          <section className="px-4">
            <Card className="shadow-md">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center gap-2">
                  <QrCode
                    weight="BoldDuotone"
                    className="w-5 h-5 text-primary"
                  />
                  <h2 className="text-lg font-bold">QR Code Absensi</h2>
                </div>
              </CardHeader>
              <CardBody className="px-4 pb-4 flex flex-col items-center gap-3">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={"attendanceId"} size={200} level="M" />
                </div>
                <p className="text-xs text-center text-default-500">
                  Scan QR code ini untuk melakukan absensi
                </p>
                <Button size="sm" variant="flat" color="primary" fullWidth>
                  Buka Link Absensi
                </Button>
              </CardBody>
            </Card>
          </section>
        )} */}

        {/* Ended */}
        {activityStatus === "ended" && activity.endDate && (
          <section className="px-4">
            <Card className="bg-linear-to-br from-default-100 to-default-200 dark:from-default-900/20 dark:to-default-800/20 border-2 border-default-200 dark:border-default-800 shadow-lg">
              <CardBody className="p-4">
                <div className="flex flex-col justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* <div className="absolute inset-0 bg-default rounded-full animate-ping opacity-75" /> */}
                      <div className="relative bg-default-600 rounded-full p-2">
                        <ClockCircle
                          weight="Broken"
                          className="size-5 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-default-700 dark:text-default-400">
                        Acara Telah Selesai
                      </h3>
                      <p className="text-xs text-default-600 dark:text-default-500">
                        Selesai pada{" "}
                        {fns.format(
                          new Date(activity.endDate),
                          "dd MMMM yyyy, HH:mm",
                          { locale: id },
                        )}{" "}
                        WIB
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>
        )}

        {/* Attendances */}
        <section className="px-4 pb-4">
          <Attendances
            activityId={activityId}
            attendances={attendances || []}
          />
        </section>
      </main>
    </div>
  );
};

export default Detail;
