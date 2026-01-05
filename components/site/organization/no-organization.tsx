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
import { useEffect, useState } from "react";
import axios from "axios";
import { OrganizationInvitation } from "@/types";
import Link from "next/link";

export default function NoOrganizationContent() {
  const auth = useAuth();
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<OrganizationInvitation | null>(null);
  const rejectModal = useDisclosure();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const res = await axios.get("/api/organization/invitations/my");
        if (res.data.success) {
          setInvitations(res.data.data);
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const handleAccept = async (invitationId: string) => {
    setAccepting(invitationId);
    try {
      const res = await axios.post("/api/organization/invitations/accept", {
        invitationId,
      });
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Anda berhasil bergabung dengan organisasi",
          color: "success",
        });
        auth.refreshUser();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        color: "danger",
      });
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async () => {
    if (!selectedInvitation) return;
    setRejecting(true);
    try {
      const res = await axios.post("/api/organization/invitations/reject", {
        invitationId: selectedInvitation.id,
      });
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Undangan berhasil ditolak",
          color: "success",
        });
        setInvitations(
          invitations.filter((i) => i.id !== selectedInvitation.id)
        );
        rejectModal.onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        color: "danger",
      });
    } finally {
      setRejecting(false);
    }
  };

  const openRejectModal = (invitation: OrganizationInvitation) => {
    setSelectedInvitation(invitation);
    rejectModal.onOpen();
  };

  return (
    <main className="p-4">
      {/* Header */}
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <BuildingIcon className="w-10 h-10 text-primary-500" />
        </div>
        <h1 className="text-xl font-bold mb-2">Belum Ada Organisasi</h1>
        <p className="text-muted-foreground text-sm">
          Anda belum bergabung dengan organisasi manapun
        </p>
      </div>

      {/* Create Organization */}
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

      {/* Invitations */}
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
                      isLoading={accepting === invitation.id}
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
            <Button color="danger" isLoading={rejecting} onPress={handleReject}>
              Ya, Tolak
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
