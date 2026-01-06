"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Skeleton,
  Tab,
  Tabs,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { MailPlusIcon, TrashIcon, UserCogIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/generated/prisma/enums";
import Navbar from "../navbar";
import {
  useOrganizationMembers,
  useOrganizationInvitations,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
  useCancelInvitation,
} from "@/hooks/queries/organization";
import { OrganizationInvitation, OrganizationUser } from "@/types";

const roleLabels: Record<string, string> = {
  KETUA: "Ketua",
  SEKRETARIS: "Sekretaris",
  BENDAHARA: "Bendahara",
  ANGGOTA: "Anggota",
  SENIOR: "Senior",
  PEMBINA: "Pembina",
};

const roleColors: Record<
  string,
  "primary" | "secondary" | "success" | "warning" | "danger" | "default"
> = {
  KETUA: "primary",
  SEKRETARIS: "secondary",
  BENDAHARA: "success",
  ANGGOTA: "default",
  SENIOR: "default",
  PEMBINA: "default",
};

export default function OrganizationUsers() {
  const auth = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("members");

  const inviteModal = useDisclosure();
  const roleModal = useDisclosure();
  const removeModal = useDisclosure();
  const cancelInviteModal = useDisclosure();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("ANGGOTA");

  const [selectedMember, setSelectedMember] = useState<OrganizationUser | null>(
    null
  );
  const [selectedInvitation, setSelectedInvitation] =
    useState<OrganizationInvitation | null>(null);
  const [newRole, setNewRole] = useState<Role>("ANGGOTA");

  const isKetua = auth.hasRole(Role.KETUA);

  const members = useOrganizationMembers();
  const invitations = useOrganizationInvitations();

  const inviteMemberMutation = useInviteMember();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const cancelInvitationMutation = useCancelInvitation();

  // useEffect(() => {
  //   if (!auth.user?.organization && !auth.isLoading) {
  //     router.push("/");
  //     return;
  //   }
  // }, [auth.user?.organization, router, auth.isLoading]);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    inviteMemberMutation
      .mutateAsync({ email: inviteEmail, role: inviteRole })
      .then((resp) => {
        addToast({
          description: "Undangan berhasil dikirim",
          color: "success",
        });
        setInviteEmail("");
        setInviteRole("ANGGOTA");
        inviteModal.onClose();
      })
      .catch((error) => {
        addToast({
          color: "danger",
          description: error.response?.data?.message || error.message,
        });
      });
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;

    updateRoleMutation
      .mutateAsync({
        memberId: selectedMember.id,
        role: newRole,
      })
      .then((resp) => {
        addToast({
          description: "Role berhasil diperbarui",
          color: "success",
        });
        if (newRole === "KETUA") auth.refreshUser();
        roleModal.onClose();
      })
      .catch((error) => {
        addToast({
          color: "danger",
          description: error.response?.data?.message || error.message,
        });
      });
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    removeMemberMutation
      .mutateAsync({ memberId: selectedMember.id })
      .then((res) => {
        addToast({
          title: "Berhasil",
          description: "Anggota berhasil dikeluarkan",
          color: "success",
        });
        removeModal.onClose();
      })
      .catch((error) => {
        addToast({
          description: error.response?.data?.message || error.message,
          color: "danger",
        });
      });
  };

  const handleCancelInvitation = async () => {
    if (!selectedInvitation) return;
    cancelInvitationMutation
      .mutateAsync({
        invitationId: selectedInvitation.id,
      })
      .then(() => {
        addToast({
          title: "Berhasil",
          description: "Undangan dibatalkan",
          color: "success",
        });
        cancelInviteModal.onClose();
      })
      .catch((error) => {
        addToast({
          description: error.response?.data?.message || error.message,
          color: "danger",
        });
      });
  };

  const openCancelInviteModal = (invitation: OrganizationInvitation) => {
    setSelectedInvitation(invitation);
    cancelInviteModal.onOpen();
  };

  const openRoleModal = (member: OrganizationUser) => {
    setSelectedMember(member);
    setNewRole(member.role || "ANGGOTA");
    roleModal.onOpen();
  };

  const openRemoveModal = (member: OrganizationUser) => {
    setSelectedMember(member);
    removeModal.onOpen();
  };

  return (
    <main className="pb-4">
      {/* Header */}
      <Navbar
        title="Kelola Anggota"
        endContent={
          isKetua && (
            <Button
              color="primary"
              size="sm"
              startContent={<MailPlusIcon className="w-4 h-4" />}
              onPress={inviteModal.onOpen}
            >
              Undang
            </Button>
          )
        }
      />

      <div className="p-4">
        {isKetua && (
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(k) => setSelectedTab(k as string)}
            className="mb-4"
          >
            <Tab key="members" title={`Anggota (${members.data?.length})`} />
            <Tab
              key="invitations"
              title={`Undangan (${invitations.data?.length})`}
            />
          </Tabs>
        )}
        {selectedTab === "members" ? (
          <div className="space-y-2">
            {members.isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            )}
            {members.data?.map((member) => (
              <Card key={member.id} className="shadow-sm">
                <CardBody className="flex flex-row items-center gap-3 p-3">
                  <Avatar src={member.avatarUrl || undefined} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.id}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    color={roleColors[member.role || "ANGGOTA"]}
                    variant="flat"
                  >
                    {roleLabels[member.role || "ANGGOTA"]}
                  </Chip>
                  {isKetua && member.id !== auth.user?.id && (
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => openRoleModal(member)}
                      >
                        <UserCogIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => openRemoveModal(member)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            )}
            {invitations.data?.length === 0 ? (
              <Card className="shadow-sm">
                <CardBody className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    Tidak ada undangan pending
                  </p>
                </CardBody>
              </Card>
            ) : (
              invitations.data?.map((invitation) => (
                <Card key={invitation.id} className="shadow-sm">
                  <CardBody className="flex flex-row items-center gap-3 p-3">
                    <Avatar size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {invitation.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Kadaluarsa:{" "}
                        {new Date(invitation.expiresAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <Chip
                      size="sm"
                      color={roleColors[invitation.role]}
                      variant="flat"
                    >
                      {roleLabels[invitation.role]}
                    </Chip>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => openCancelInviteModal(invitation)}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal isOpen={inviteModal.isOpen} onClose={inviteModal.onClose}>
        <ModalContent>
          <ModalHeader>Undang Anggota</ModalHeader>
          <ModalBody>
            <Input
              label="Email"
              placeholder="email@example.com"
              type="email"
              value={inviteEmail}
              onValueChange={setInviteEmail}
            />
            <Select
              label="Role"
              selectedKeys={[inviteRole]}
              onSelectionChange={(keys) =>
                setInviteRole(Array.from(keys)[0] as Role)
              }
            >
              <SelectItem key="ANGGOTA">Anggota</SelectItem>
              <SelectItem key="SEKRETARIS">Sekretaris</SelectItem>
              <SelectItem key="BENDAHARA">Bendahara</SelectItem>
              <SelectItem key="SENIOR">Senior</SelectItem>
              <SelectItem key="PEMBINA">Pembina</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={inviteModal.onClose}>
              Batal
            </Button>
            <Button
              color="primary"
              isLoading={inviteMemberMutation.isPending}
              onPress={handleInvite}
            >
              Kirim Undangan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Role Modal */}
      <Modal isOpen={roleModal.isOpen} onClose={roleModal.onClose}>
        <ModalContent>
          <ModalHeader>Ubah Role</ModalHeader>
          <ModalBody>
            <p className="text-sm mb-3">
              Ubah role untuk {selectedMember?.name}
            </p>
            <Select
              label="Role Baru"
              selectedKeys={[newRole]}
              onSelectionChange={(keys) =>
                setNewRole(Array.from(keys)[0] as Role)
              }
            >
              <SelectItem key="KETUA">Ketua</SelectItem>
              <SelectItem key="SEKRETARIS">Sekretaris</SelectItem>
              <SelectItem key="BENDAHARA">Bendahara</SelectItem>
              <SelectItem key="ANGGOTA">Anggota</SelectItem>
              <SelectItem key="SENIOR">Senior</SelectItem>
              <SelectItem key="PEMBINA">Pembina</SelectItem>
            </Select>
            {newRole === "KETUA" && (
              <p className="text-xs text-warning-600 mt-2">
                ⚠️ Mengubah ke Ketua akan menurunkan role Anda menjadi Anggota
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={roleModal.onClose}>
              Batal
            </Button>
            <Button
              color="primary"
              isLoading={updateRoleMutation.isPending}
              onPress={handleUpdateRole}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Remove Modal */}
      <Modal isOpen={removeModal.isOpen} onClose={removeModal.onClose}>
        <ModalContent>
          <ModalHeader>Keluarkan Anggota</ModalHeader>
          <ModalBody>
            <p className="text-sm">
              Apakah Anda yakin ingin mengeluarkan{" "}
              <strong>{selectedMember?.name}</strong> dari organisasi?
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Tindakan ini tidak dapat dibatalkan. Anggota perlu diundang
              kembali untuk bergabung.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={removeModal.onClose}>
              Batal
            </Button>
            <Button
              color="danger"
              isLoading={removeMemberMutation.isPending}
              onPress={handleRemoveMember}
            >
              Keluarkan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Invitation Modal */}
      <Modal
        isOpen={cancelInviteModal.isOpen}
        onClose={cancelInviteModal.onClose}
      >
        <ModalContent>
          <ModalHeader>Batalkan Undangan</ModalHeader>
          <ModalBody>
            <p className="text-sm">
              Apakah Anda yakin ingin membatalkan undangan untuk{" "}
              <strong>{selectedInvitation?.email}</strong>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={cancelInviteModal.onClose}>
              Tidak
            </Button>
            <Button
              color="danger"
              isLoading={cancelInvitationMutation.isPending}
              onPress={handleCancelInvitation}
            >
              Ya, Batalkan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}
