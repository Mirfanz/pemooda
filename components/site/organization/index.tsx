"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Skeleton,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
} from "@heroui/react";
import {
  BuildingIcon,
  MapPinIcon,
  PhoneIcon,
  SettingsIcon,
  UsersIcon,
  CalendarIcon,
  QrCodeIcon,
} from "lucide-react";
import {
  CalendarBoldIcon,
  InstagramIcon,
  TwitterXIcon,
  UsersBoldIcon,
  WalletBoldIcon,
  WhatsappIcon,
} from "@/components/icons";
import Link from "next/link";
import NoOrganizationContent from "./no-organization";
import { Role } from "@/lib/generated/prisma/enums";
import {
  useOrganizationDetail,
  useLeaveOrganization,
} from "@/hooks/queries/organization";
import { roleLabel } from "@/config/enum-label";
import { cn } from "@/lib/utils";

const fastMenuItems = [
  {
    label: "Absen",
    icon: QrCodeIcon,
    href: "/absen",
  },
  {
    label: "Anggota",
    icon: UsersBoldIcon,
    href: "/organization/members",
  },
  {
    label: "Kegiatan",
    icon: CalendarBoldIcon,
    href: "/activity",
  },
  {
    label: "Keuangan",
    icon: WalletBoldIcon,
    href: "/finance",
  },
];

const Organization = () => {
  const auth = useAuth();
  const leaveModal = useDisclosure();

  const organization = useOrganizationDetail();
  const leaveOrganizationMutation = useLeaveOrganization();

  const handleLeave = () => {
    leaveOrganizationMutation
      .mutateAsync()
      .then((res) => {
        addToast({ description: "Anda telah keluar dari organisasi" });
        auth.refreshUser();
        leaveModal.onClose();
      })
      .catch((error) => {
        addToast({
          description: error.response?.data?.message || error.message,
          color: "danger",
        });
      });
  };

  if (organization.isLoading || auth.isLoading) {
    return (
      <main className="p-4 space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </main>
    );
  }

  if (organization.error || !auth.user?.organization || !organization.data) {
    return <NoOrganizationContent />;
  }

  const isKetua = auth.hasRole(Role.KETUA);

  return (
    <main className="pb-4">
      <div className="bg-linear-to-b from-primary to-primary-800 text-white p-4 pb-16 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Organisasi</h1>
          {isKetua && (
            <Button
              as={Link}
              href="/organization/settings"
              isIconOnly
              variant="light"
              className="text-white"
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="text-center">
          <Avatar
            src={organization.data.imageUrl || undefined}
            className="w-20 h-20 mx-auto mb-3 ring-4 ring-white/30"
            fallback={<BuildingIcon className="w-8 h-8" />}
          />
          <h2 className="text-xl font-bold">{organization.data.name}</h2>
          {organization.data.tagline && (
            <p className="text-white/80 text-sm mt-1">
              {organization.data.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-10">
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-lg">
            <CardBody className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
                <UsersIcon className="w-5 h-5 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-primary-600">
                {organization.data.summary?.totalMembers || 0}
              </p>
              <p className="text-xs text-muted-foreground">Anggota</p>
            </CardBody>
          </Card>
          <Card className="shadow-lg">
            <CardBody className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="w-5 h-5 text-success-600" />
              </div>
              <p className="text-2xl font-bold text-success-600">
                {organization.data.summary?.totalActivities || 0}
              </p>
              <p className="text-xs text-muted-foreground">Kegiatan</p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Your Role */}
      <div className="px-4 mt-4">
        <Card className="shadow-sm">
          <CardBody className="flex flex-row items-center gap-3">
            <Avatar src={auth.user.avatarUrl || undefined} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-medium">{auth.user.name}</p>
              <p className="text-xs text-muted-foreground">Anda</p>
            </div>
            <Chip size="sm" color="primary" variant="flat">
              {roleLabel[auth.user.role || "ANGGOTA"]}
            </Chip>
          </CardBody>
        </Card>
      </div>

      {/* Menu Cepat */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Menu Cepat
        </h3>
        <div className="grid gap-2.5 grid-cols-4">
          {fastMenuItems.map((item) => {
            return (
              <Button
                key={item.label}
                as={Link}
                href={item.href}
                variant="bordered"
                color="primary"
                className={cn(
                  "flex-col shadow-lg gap-1 border-1 aspect-square min-w-0 size-auto",
                  "shadow-teal-600/10 bg-teal-600/5 border-teal-600 text-teal-600",
                )}
                startContent={<item.icon className="size-7" />}
              >
                <small className="text-xs font-medium">{item.label}</small>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Informasi Kontak
        </h3>
        <Card className="shadow-sm">
          <CardBody className="space-y-3">
            {organization.data.phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                  <PhoneIcon className="w-4 h-4 text-success-600" />
                </div>
                <span className="text-sm">{organization.data.phone}</span>
              </div>
            )}
            {organization.data.address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-warning-600" />
                </div>
                <span className="text-sm">{organization.data.address}</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Social Media */}
      {(organization.data.instagramUrl ||
        organization.data.twitterUrl ||
        organization.data.facebookUrl) && (
        <div className="px-4 mt-4">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Media Sosial
          </h3>
          <div className="flex gap-2">
            {organization.data.instagramUrl && (
              <Button
                as="a"
                href={organization.data.instagramUrl}
                target="_blank"
                isIconOnly
                variant="flat"
                className="bg-linear-to-br from-purple-500 to-pink-500 text-white"
              >
                <InstagramIcon className="w-5 h-5" />
              </Button>
            )}
            {organization.data.twitterUrl && (
              <Button
                as="a"
                href={organization.data.twitterUrl}
                target="_blank"
                isIconOnly
                variant="flat"
                className="bg-black text-white"
              >
                <TwitterXIcon className="w-5 h-5" />
              </Button>
            )}
            {organization.data.facebookUrl && (
              <Button
                as="a"
                href={organization.data.facebookUrl}
                target="_blank"
                isIconOnly
                variant="flat"
                color="primary"
              >
                <WhatsappIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={leaveModal.isOpen} onClose={leaveModal.onClose}>
        <ModalContent>
          <ModalHeader>Keluar dari Organisasi</ModalHeader>
          <ModalBody>
            <p className="text-sm">
              Apakah Anda yakin ingin keluar dari{" "}
              <strong>{organization.data.name}</strong>? Anda perlu diundang
              kembali untuk bergabung lagi.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={leaveModal.onClose}>
              Batal
            </Button>
            <Button
              color="danger"
              isLoading={leaveOrganizationMutation.isPending}
              onPress={handleLeave}
            >
              Keluar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
};

export default Organization;
