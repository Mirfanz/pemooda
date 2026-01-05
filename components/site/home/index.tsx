"use client";

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
import {
  ArrowUpRightFromSquareIcon,
  BellRingIcon,
  BuildingIcon,
  CheckIcon,
  DollarSignIcon,
  MailIcon,
  PlusIcon,
  WalletIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { InstagramIcon, WhatsappIcon, TwitterXIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { OrganizationInvitation } from "@/types";
import Link from "next/link";

const Home = () => {
  const auth = useAuth();
  const hasOrganization = !!auth.user?.organization;

  return (
    <main className="">
      <div className="bg-white shadow-xl rounded-b-3xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={auth.user?.avatarUrl || undefined} isBordered />
          <div className="">
            <p className="text-sm text-muted-foreground">Selamat Datang</p>
            <h4 className="font-bold">{auth.user?.name}</h4>
          </div>
          <Button isIconOnly className="rounded-full ms-auto" variant="light">
            <BellRingIcon className="w-5! h-5!" />
          </Button>
        </div>

        {hasOrganization ? <OrganizationCard /> : <NoOrganizationCard />}
      </div>

      {hasOrganization ? (
        <div className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 flex relative flex-col text-warning rounded-xl shadow bg-white p-4">
              <Button
                isIconOnly
                variant="flat"
                className="text-warning bg-warning-50 mb-2"
              >
                <DollarSignIcon className="w-5! h-5!" />
              </Button>
              <small className="text-xs mb-0.5 font-medium text-muted-foreground/70">
                Tagihan Anda
              </small>
              <p className="font-bold text-md">Rp 10.000</p>
              <Button
                className="top-2 right-2 absolute"
                variant="light"
                isIconOnly
                size="sm"
              >
                <ArrowUpRightFromSquareIcon className="w-4! h-4!" />
              </Button>
            </div>
            <div className="flex-1 flex relative flex-col text-primary rounded-xl shadow bg-white p-4">
              <Button
                isIconOnly
                variant="flat"
                className="text-inherit bg-primary-50 mb-2"
              >
                <WalletIcon className="w-5! h-5!" />
              </Button>
              <small className="text-xs mb-0.5 font-medium text-muted-foreground/70">
                Sisa Saldo
              </small>
              <p className="font-bold text-md font-poppins!">Rp 19.000.000</p>
              <Button
                className="top-2 right-2 absolute"
                variant="light"
                isIconOnly
                size="sm"
              >
                <ArrowUpRightFromSquareIcon className="w-4! h-4!" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <InvitationsSection />
      )}
    </main>
  );
};

function OrganizationCard() {
  const auth = useAuth();

  return (
    <Card className="bg-linear-to-br relative from-[#5046E5] to-[#6C2ADA] text-white">
      <CardBody className="overflow-hidden">
        <div className="w-32 h-32 translate-x-10 -translate-y-10 opacity-10 bg-white rounded-full absolute top-0 right-0"></div>
        <div className="relative">
          <div className="mb-4">
            <span className="uppercase bg-white/20 rounded-sm text-white text-xs px-2 py-1 inline-block">
              Kartu Anggota
            </span>
          </div>
          <h3 className="font-bold text-xl mb-1 font-poppins text-center">
            {auth.user?.organization?.name}
          </h3>
          <p className="text-sm text-white/80 mb-3 text-center">
            {auth.user?.organization?.tagline}
          </p>
          <div className="flex gap-6 justify-center">
            <Button
              size="sm"
              variant="bordered"
              color="default"
              isIconOnly
              className="text-primary-foreground"
            >
              <InstagramIcon className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="bordered"
              color="default"
              isIconOnly
              className="text-primary-foreground"
            >
              <TwitterXIcon className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="bordered"
              color="default"
              isIconOnly
              className="text-primary-foreground"
            >
              <WhatsappIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function NoOrganizationCard() {
  return (
    <Card className="bg-linear-to-br relative from-slate-600 to-slate-800 text-white">
      <CardBody className="overflow-hidden">
        <div className="w-32 h-32 translate-x-10 -translate-y-10 opacity-10 bg-white rounded-full absolute top-0 right-0"></div>
        <div className="relative text-center py-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <BuildingIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-1">Belum Ada Organisasi</h3>
          <p className="text-sm text-white/70 mb-4">
            Buat atau bergabung dengan organisasi
          </p>
          <Button
            as={Link}
            href="/organization/new"
            color="primary"
            size="sm"
            startContent={<PlusIcon className="w-4 h-4" />}
          >
            Buat Organisasi
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function InvitationsSection() {
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

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <MailIcon className="w-4 h-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm text-muted-foreground">
          Undangan Bergabung
        </h2>
      </div>
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
    </div>
  );
}

export default Home;
