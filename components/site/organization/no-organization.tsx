"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Skeleton,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { BuildingIcon, PlusIcon, MailIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { OrganizationInvitation } from "@/types";
import Link from "next/link";
import {
  useMyInvitations,
  useAcceptInvitation,
  useRejectInvitation,
} from "@/hooks/queries/organization";

const NoOrganization = () => {
  const auth = useAuth();
  const [selectedInvitation, setSelectedInvitation] =
    useState<OrganizationInvitation | null>(null);
  const rejectModal = useDisclosure();

  const { data: invitations = [], isLoading: loading } = useMyInvitations();
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();

  const handleAccept = async (invitationId: string) => {
    await acceptMutation
      .mutateAsync({ invitationId })
      .then(() => {
        addToast({
          description: "Anda berhasil bergabung dengan organisasi",
          color: "success",
        });
        auth.refreshUser();
      })
      .catch((error) => {
        addToast({
          description: error.response?.data?.message || "Terjadi kesalahan",
          color: "danger",
        });
      });
  };

  const handleReject = async () => {
    if (!selectedInvitation) return;
    rejectMutation
      .mutateAsync({ invitationId: selectedInvitation.id })
      .then(() => {
        addToast({
          description: "Undangan berhasil ditolak",
        });
        rejectModal.onClose();
      })
      .catch((error) => {
        addToast({
          description: error.response?.data?.message || "Terjadi kesalahan",
          color: "danger",
        });
      });
  };

  const openRejectModal = (invitation: OrganizationInvitation) => {
    setSelectedInvitation(invitation);
    rejectModal.onOpen();
  };

  return (
    <main className="p-4">
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <BuildingIcon className="w-10 h-10 text-primary-500" />
        </div>
        <h1 className="text-xl font-bold mb-2">Belum Ada Organisasi</h1>
        <p className="text-muted-foreground text-sm">
          Anda belum bergabung dengan organisasi manapun
        </p>
      </div>

      <Card className="shadow-lg mb-6">
        <CardBody className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <PlusIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold">Buat Organisasi Baru</h3>
              <p className="text-xs text-muted-foreground">
                Mulai organisasi Anda sendiri
              </p>
            </div>
          </div>
          <Button
            as={Link}
            href="/organization/new"
            color="primary"
            className="w-full"
          >
            Buat Organisasi
          </Button>
        </CardBody>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <MailIcon className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm text-muted-foreground">
            Undangan Bergabung
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : invitations.length === 0 ? (
          <Card className="shadow-sm">
            <CardBody className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Tidak ada undangan saat ini
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <Card key={invitation.id} className="shadow-sm">
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={invitation.organization.imageUrl || undefined}
                      fallback={<BuildingIcon className="w-4 h-4" />}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {invitation.organization.name}
                      </h4>
                      {invitation.organization.tagline && (
                        <p className="text-xs text-muted-foreground truncate">
                          {invitation.organization.tagline}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Diundang oleh {invitation.creator.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="flat"
                      size="sm"
                      className="flex-1"
                      onPress={() => openRejectModal(invitation)}
                    >
                      Tolak
                    </Button>
                    <Button
                      color="success"
                      size="sm"
                      className="flex-1"
                      startContent={<CheckIcon className="w-4 h-4" />}
                      isLoading={acceptMutation.isPending}
                      onPress={() => handleAccept(invitation.id)}
                    >
                      Bergabung
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Invitation Modal */}
      <Modal isOpen={rejectModal.isOpen} onClose={rejectModal.onClose}>
        <ModalContent>
          <ModalHeader>Tolak Undangan</ModalHeader>
          <ModalBody>
            <p className="text-sm">
              Apakah Anda yakin ingin menolak undangan dari{" "}
              <strong>{selectedInvitation?.organization.name}</strong>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={rejectModal.onClose}>
              Batal
            </Button>
            <Button
              color="danger"
              isLoading={rejectMutation.isPending}
              onPress={handleReject}
            >
              Ya, Tolak
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
};

export default NoOrganization;
