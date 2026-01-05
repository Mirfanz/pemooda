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
  LogOutIcon,
} from "lucide-react";
import { InstagramIcon, TwitterXIcon, WhatsappIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { OrganizationFull } from "@/types";
import Link from "next/link";
import NoOrganizationContent from "./no-organization";
import { Role } from "@/lib/generated/prisma/enums";

const roleLabels: Record<string, string> = {
  KETUA: "Ketua",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  ANGGOTA: "Anggota",
  SENIOR: "Senior",
  PEMBINA: "Pembina",
};

export default function OrganizationPage() {
  const auth = useAuth();
  const [organization, setOrganization] = useState<OrganizationFull | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const leaveModal = useDisclosure();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await axios.get("/api/organization/detail");
        if (res.data.success) {
          setOrganization(res.data.data);
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    if (auth.user?.organization) {
      fetchOrganization();
    } else {
      setLoading(false);
    }
  }, [auth.user?.organization]);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const res = await axios.post("/api/organization/leave");
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Anda telah keluar dari organisasi",
          color: "success",
        });
        auth.refreshUser();
        leaveModal.onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        color: "danger",
      });
    } finally {
      setLeaving(false);
    }
  };

  if (loading || auth.isLoading) {
    return (
      <main className="p-4 space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </main>
    );
  }

  if (!auth.user?.organization || !organization) {
    return <NoOrganizationContent />;
  }

  return (
    <main className="pb-4">
      <div className="bg-linear-to-br from-primary-500 to-primary-700 text-white p-4 pb-16 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Organisasi</h1>
          {auth.hasRole(Role.KETUA) && (
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
            src={organization.imageUrl || undefined}
            className="w-20 h-20 mx-auto mb-3 ring-4 ring-white/30"
            fallback={<BuildingIcon className="w-8 h-8" />}
          />
          <h2 className="text-xl font-bold">{organization.name}</h2>
          {organization.tagline && (
            <p className="text-white/80 text-sm mt-1">{organization.tagline}</p>
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
                {organization.summary?.totalMembers || 0}
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
                {organization.summary?.totalActivities || 0}
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
              {roleLabels[auth.user.role || "ANGGOTA"]}
            </Chip>
          </CardBody>
        </Card>
      </div>

      {/* Contact Info */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Informasi Kontak
        </h3>
        <Card className="shadow-sm">
          <CardBody className="space-y-3">
            {organization.phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
                  <PhoneIcon className="w-4 h-4 text-success-600" />
                </div>
                <span className="text-sm">{organization.phone}</span>
              </div>
            )}
            {organization.address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-warning-600" />
                </div>
                <span className="text-sm">{organization.address}</span>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Social Media */}
      {(organization.instagramUrl ||
        organization.twitterUrl ||
        organization.facebookUrl) && (
        <div className="px-4 mt-4">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
            Media Sosial
          </h3>
          <div className="flex gap-2">
            {organization.instagramUrl && (
              <Button
                as="a"
                href={organization.instagramUrl}
                target="_blank"
                isIconOnly
                variant="flat"
                className="bg-linear-to-br from-purple-500 to-pink-500 text-white"
              >
                <InstagramIcon className="w-5 h-5" />
              </Button>
            )}
            {organization.twitterUrl && (
              <Button
                as="a"
                href={organization.twitterUrl}
                target="_blank"
                isIconOnly
                variant="flat"
                className="bg-black text-white"
              >
                <TwitterXIcon className="w-5 h-5" />
              </Button>
            )}
            {organization.facebookUrl && (
              <Button
                as="a"
                href={organization.facebookUrl}
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

      {/* Quick Actions */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Menu
        </h3>
        <div className="space-y-2">
          <Button
            as={Link}
            href="/organization/members"
            variant="flat"
            className="w-full justify-start h-12"
            startContent={<UsersIcon className="w-5 h-5" />}
          >
            Kelola Anggota
          </Button>
          <Button
            variant="flat"
            color="danger"
            className="w-full justify-start h-12"
            startContent={<LogOutIcon className="w-5 h-5" />}
            onPress={leaveModal.onOpen}
            isDisabled={auth.hasRole(Role.KETUA)}
          >
            Keluar dari Organisasi
          </Button>
        </div>
      </div>

      <Modal isOpen={leaveModal.isOpen} onClose={leaveModal.onClose}>
        <ModalContent>
          <ModalHeader>Keluar dari Organisasi</ModalHeader>
          <ModalBody>
            <p className="text-sm">
              Apakah Anda yakin ingin keluar dari{" "}
              <strong>{organization.name}</strong>? Anda perlu diundang kembali
              untuk bergabung lagi.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={leaveModal.onClose}>
              Batal
            </Button>
            <Button color="danger" isLoading={leaving} onPress={handleLeave}>
              Keluar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
