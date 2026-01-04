"use client";

import React, { useState } from "react";
import { Button, Card, CardBody, Chip, Tabs, Tab } from "@heroui/react";
import {
  BellIcon,
  CalendarIcon,
  InfoIcon,
  MegaphoneIcon,
  CheckCheckIcon,
} from "lucide-react";

type NotificationType = "all" | "announcement" | "event" | "system";

interface Notification {
  id: string;
  type: "announcement" | "event" | "system";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon?: React.ReactNode;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "announcement",
    title: "Pengumuman Penting",
    message: "Rapat anggota akan dilaksanakan pada tanggal 15 Januari 2026",
    time: "2 jam yang lalu",
    isRead: false,
  },
  {
    id: "2",
    type: "event",
    title: "Event Bakti Sosial",
    message: "Jangan lupa untuk hadir di acara bakti sosial minggu depan",
    time: "5 jam yang lalu",
    isRead: false,
  },
  {
    id: "3",
    type: "system",
    title: "Pembayaran Berhasil",
    message: "Pembayaran iuran bulan Januari telah berhasil diproses",
    time: "1 hari yang lalu",
    isRead: true,
  },
  {
    id: "4",
    type: "announcement",
    title: "Update Peraturan",
    message: "Terdapat pembaruan pada peraturan organisasi",
    time: "2 hari yang lalu",
    isRead: true,
  },
  {
    id: "5",
    type: "event",
    title: "Pelatihan Leadership",
    message: "Pendaftaran pelatihan leadership telah dibuka",
    time: "3 hari yang lalu",
    isRead: true,
  },
];

const AnnouncementMain = () => {
  const [selectedType, setSelectedType] = useState<NotificationType>("all");
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const filteredNotifications =
    selectedType === "all"
      ? notifications
      : notifications.filter((n) => n.type === selectedType);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <MegaphoneIcon className="size-5" />;
      case "event":
        return <CalendarIcon className="size-5" />;
      case "system":
        return <InfoIcon className="size-5" />;
      default:
        return <BellIcon className="size-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-primary-50 text-primary";
      case "event":
        return "bg-success-50 text-success";
      case "system":
        return "bg-warning-50 text-warning";
      default:
        return "bg-default-50 text-default";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm rounded-b-3xl p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} notifikasi belum dibaca
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onPress={markAllAsRead}
              startContent={<CheckCheckIcon className="size-4" />}
            >
              Tandai Semua
            </Button>
          )}
        </div>

        <Tabs
          selectedKey={selectedType}
          onSelectionChange={(key) => setSelectedType(key as NotificationType)}
          variant="underlined"
          color="primary"
        >
          <Tab key="all" title="Semua" />
          <Tab key="announcement" title="Pengumuman" />
          <Tab key="event" title="Event" />
          <Tab key="system" title="Sistem" />
        </Tabs>
      </div>

      <div className="p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-12">
              <BellIcon className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Tidak ada notifikasi</p>
            </CardBody>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`shadow-sm transition-all ${
                !notif.isRead
                  ? "bg-primary-50/30 border-l-4 border-primary"
                  : ""
              }`}
              isPressable
            >
              <CardBody className="p-4">
                <div className="flex gap-3">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(
                      notif.type
                    )}`}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      {!notif.isRead && (
                        <Chip size="sm" color="primary" variant="dot">
                          Baru
                        </Chip>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {notif.time}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </main>
  );
};

export default AnnouncementMain;
