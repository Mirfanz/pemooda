"use client";

import React from "react";
import { Button, Card, CardBody, Divider, Avatar, Chip } from "@heroui/react";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  LogOutIcon,
  ChevronRightIcon,
  SettingsIcon,
  BellIcon,
  LockIcon,
  HelpCircleIcon,
  FileTextIcon,
  CreditCardIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

const Account = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const menuItems = [
    {
      icon: SettingsIcon,
      label: "Pengaturan Akun",
      description: "Kelola informasi pribadi",
      href: "/account/settings",
    },
    {
      icon: BellIcon,
      label: "Notifikasi",
      description: "Atur preferensi notifikasi",
      href: "/account/notifications",
    },
    {
      icon: LockIcon,
      label: "Keamanan",
      description: "Password dan keamanan",
      href: "/account/security",
    },
    {
      icon: CreditCardIcon,
      label: "Metode Pembayaran",
      description: "Kelola metode pembayaran",
      href: "/account/payment",
    },
  ];

  const supportItems = [
    {
      icon: HelpCircleIcon,
      label: "Bantuan & Dukungan",
      href: "/help",
    },
    {
      icon: FileTextIcon,
      label: "Syarat & Ketentuan",
      href: "/terms",
    },
    {
      icon: ShieldCheckIcon,
      label: "Kebijakan Privasi",
      href: "/privacy",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-br from-primary to-primary-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            src={user?.avatarUrl || undefined}
            className="w-20 h-20 text-large"
            isBordered
            color="default"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {user?.name || "Nama Pengguna"}
            </h1>
            <Chip
              size="sm"
              variant="flat"
              className="bg-white/20 text-white"
              startContent={<ShieldCheckIcon className="size-3" />}
            >
              Anggota Aktif
            </Chip>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-white/70 mb-1">Organization</p>
            <p className="font-semibold">{user?.organization?.name}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs text-white/70 mb-1">Bergabung</p>
            <p className="font-semibold">Jan 2024</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="shadow-sm">
          <CardBody className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                <MailIcon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">fake.email@gmail.com</p>
              </div>
            </div>

            <Divider />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success-50 flex items-center justify-center text-success">
                <PhoneIcon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Telepon</p>
                <p className="font-medium">+62 812-3456-7890</p>
              </div>
            </div>

            <Divider />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning-50 flex items-center justify-center text-warning">
                <MapPinIcon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Alamat</p>
                <p className="font-medium">Jakarta, Indonesia</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            PENGATURAN
          </h2>
          <Card className="shadow-sm">
            <CardBody className="p-0">
              {menuItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <Button
                    variant="light"
                    className="w-full justify-start h-auto py-4 px-4"
                    onPress={() => router.push(item.href)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center">
                        <item.icon className="size-5 text-default-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRightIcon className="size-5 text-muted-foreground" />
                    </div>
                  </Button>
                  {index < menuItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </CardBody>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
            DUKUNGAN
          </h2>
          <Card className="shadow-sm">
            <CardBody className="p-0">
              {supportItems.map((item, index) => (
                <React.Fragment key={item.label}>
                  <Button
                    variant="light"
                    className="w-full justify-start h-auto py-3 px-4"
                    onPress={() => router.push(item.href)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <item.icon className="size-5 text-default-600" />
                      <p className="font-medium text-sm flex-1 text-left">
                        {item.label}
                      </p>
                      <ChevronRightIcon className="size-5 text-muted-foreground" />
                    </div>
                  </Button>
                  {index < supportItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </CardBody>
          </Card>
        </div>

        <Button
          color="danger"
          variant="flat"
          className="w-full"
          size="lg"
          startContent={<LogOutIcon className="size-5" />}
          onPress={handleLogout}
        >
          Keluar
        </Button>

        <p className="text-center text-xs text-muted-foreground py-4">
          Version 1.0.0
        </p>
      </div>
    </main>
  );
};

export default Account;
