"use client";

import { useActivity, useDeleteActivity } from "@/hooks/queries/activity";
import Navbar from "../navbar";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Skeleton,
  Divider,
  Progress,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { activityTypeEnum, attendeeStatusEnum } from "@/config/enums";
import * as fns from "date-fns";
import { id } from "date-fns/locale";
import {
  Share,
  PenNewSquare,
  TrashBinTrash,
  CheckCircle,
  CloseCircle,
  MinusCircle,
  DangerCircle,
  MenuDots,
  CalendarMark,
  MapPointWave,
  SquareTopDown,
  DocumentAdd,
  UsersGroupRounded,
  Wallet,
} from "@solar-icons/react";
import Link from "next/link";
import { displayIntervalDate } from "@/lib/utils";
import Countdown from "./countdown";
import { useAuth } from "@/contexts/auth-context";
import { Role } from "@/lib/generated/prisma/enums";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

type Props = {
  activityId: string;
};

// Dummy data for attendance
const dummyAttendance = [
  { id: "1", name: "Ahmad Fauzi", avatarUrl: null, status: "PRESENT" as const },
  {
    id: "2",
    name: "Siti Nurhaliza",
    avatarUrl: null,
    status: "PRESENT" as const,
  },
  { id: "3", name: "Budi Santoso", avatarUrl: null, status: "EXCUSE" as const },
  {
    id: "4",
    name: "Dewi Lestari",
    avatarUrl: null,
    status: "PRESENT" as const,
  },
  { id: "5", name: "Eko Prasetyo", avatarUrl: null, status: "ABSENT" as const },
  {
    id: "6",
    name: "Fitri Handayani",
    avatarUrl: null,
    status: "PRESENT" as const,
  },
  {
    id: "7",
    name: "Gunawan Wijaya",
    avatarUrl: null,
    status: "PENDING" as const,
  },
  { id: "8", name: "Hani Kusuma", avatarUrl: null, status: "PRESENT" as const },
];

// Dummy data for budget
const dummyBudget = {
  total: 5000000,
  expenses: [
    {
      id: "1",
      category: "Konsumsi",
      amount: 1500000,
      description: "Snack dan makan siang peserta",
    },
    {
      id: "2",
      category: "Transportasi",
      amount: 800000,
      description: "Sewa bus dan BBM",
    },
    {
      id: "3",
      category: "Perlengkapan",
      amount: 600000,
      description: "Spanduk, banner, dan ATK",
    },
    {
      id: "4",
      category: "Dokumentasi",
      amount: 400000,
      description: "Fotografer dan videografer",
    },
    {
      id: "5",
      category: "Lain-lain",
      amount: 200000,
      description: "Biaya tak terduga",
    },
  ],
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PRESENT":
      return <CheckCircle weight="Broken" className="w-4 h-4 text-success" />;
    case "ABSENT":
      return <CloseCircle weight="Broken" className="w-4 h-4 text-danger" />;
    case "EXCUSE":
      return <DangerCircle weight="Broken" className="w-4 h-4 text-warning" />;
    default:
      return (
        <MinusCircle weight="Broken" className="w-4 h-4 text-default-400" />
      );
  }
};

const Detail = ({ activityId }: Props) => {
  const { isLoading, data: activity } = useActivity(activityId);
  const auth = useAuth();
  const router = useRouter();
  const deleteActivity = useDeleteActivity();

  const totalExpenses = dummyBudget.expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );
  const remaining = dummyBudget.total - totalExpenses;
  const budgetUsedPercentage = (totalExpenses / dummyBudget.total) * 100;

  const attendanceStats = {
    present: dummyAttendance.filter((a) => a.status === "PRESENT").length,
    absent: dummyAttendance.filter((a) => a.status === "ABSENT").length,
    excuse: dummyAttendance.filter((a) => a.status === "EXCUSE").length,
    pending: dummyAttendance.filter((a) => a.status === "PENDING").length,
    total: dummyAttendance.length,
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
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sharing:", error);
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
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Terjadi kesalahan saat menghapus kegiatan",
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
              <Chip
                size="sm"
                variant="dot"
                radius="sm"
                color={activity.endDate ? "default" : "warning"}
              >
                {displayIntervalDate(activity.startDate)}
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

        <section className="px-4">
          <Countdown targetDate={activity.startDate} />
        </section>

        {/* Attendance */}
        <section className="px-4">
          <Card className="shadow-md " fullWidth>
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <UsersGroupRounded
                    weight="BoldDuotone"
                    className="w-5 h-5 text-primary"
                  />
                  <h2 className="text-lg font-bold">Kehadiran</h2>
                </div>
                <Chip size="sm" variant="flat" color="primary">
                  {attendanceStats.present}/{attendanceStats.total}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="px-4 pb-4 space-y-4">
              {/* Attendance Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-success-50 dark:bg-success-900/20 rounded-lg">
                  <p className="text-lg font-bold text-success">
                    {attendanceStats.present}
                  </p>
                  <p className="text-xs text-success-600 dark:text-success-400">
                    Hadir
                  </p>
                </div>
                <div className="text-center p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                  <p className="text-lg font-bold text-warning">
                    {attendanceStats.excuse}
                  </p>
                  <p className="text-xs text-warning-600 dark:text-warning-400">
                    Izin
                  </p>
                </div>
                <div className="text-center p-2 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                  <p className="text-lg font-bold text-danger">
                    {attendanceStats.absent}
                  </p>
                  <p className="text-xs text-danger-600 dark:text-danger-400">
                    Alfa
                  </p>
                </div>
                <div className="text-center p-2 bg-default-100 dark:bg-default-900/20 rounded-lg">
                  <p className="text-lg font-bold text-default-600">
                    {attendanceStats.pending}
                  </p>
                  <p className="text-xs text-default-500">Belum</p>
                </div>
              </div>

              <Divider />

              {/* Attendance List */}
              <div className="space-y-2">
                {dummyAttendance.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-default-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar
                        size="sm"
                        name={attendee.name}
                        src={attendee.avatarUrl || undefined}
                        className="shrink-0"
                      />
                      <p className="text-sm font-medium text-foreground truncate">
                        {attendee.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusIcon(attendee.status)}
                      <span className="text-xs text-default-500">
                        {attendeeStatusEnum[attendee.status].label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Budget */}
        <section className="px-4">
          <Card className="shadow-md " fullWidth>
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Wallet
                    weight="BoldDuotone"
                    className="w-5 h-5 text-success"
                  />
                  <h2 className="text-lg font-bold">Anggaran</h2>
                </div>
              </div>
            </CardHeader>
            <CardBody className="px-4 pb-4 space-y-4">
              {/* Budget Overview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">
                    Total Anggaran
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Rp {dummyBudget.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">
                    Total Pengeluaran
                  </span>
                  <span className="text-sm font-bold text-danger">
                    Rp {totalExpenses.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-600">
                    Sisa Anggaran
                  </span>
                  <span
                    className={`text-sm font-bold ${remaining >= 0 ? "text-success" : "text-danger"}`}
                  >
                    Rp {remaining.toLocaleString("id-ID")}
                  </span>
                </div>

                <Progress
                  size="sm"
                  value={budgetUsedPercentage}
                  color={
                    budgetUsedPercentage > 90
                      ? "danger"
                      : budgetUsedPercentage > 70
                        ? "warning"
                        : "success"
                  }
                  className="mt-2"
                />
                <p className="text-xs text-center text-default-500">
                  {budgetUsedPercentage.toFixed(1)}% terpakai
                </p>
              </div>

              <Divider />

              {/* Expense List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Rincian Pengeluaran
                </h3>
                {dummyBudget.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="space-y-1 p-3 bg-default-50 dark:bg-default-900/20 rounded-lg"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {expense.category}
                        </p>
                        <p className="text-xs text-default-500 mt-0.5">
                          {expense.description}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-danger shrink-0">
                        Rp {expense.amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Detail;
