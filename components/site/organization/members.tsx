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
import { useEffect, useState } from "react";
import axios from "axios";
import { OrganizationUser } from "@/types";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/generated/prisma/enums";
import Navbar from "../navbar";

interface Invitation {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  expiresAt: string;
  creator: { id: string; name: string };
}

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
  const [members, setMembers] = useState<OrganizationUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("members");

  const inviteModal = useDisclosure();
  const roleModal = useDisclosure();
  const removeModal = useDisclosure();
  const cancelInviteModal = useDisclosure();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("ANGGOTA");
  const [inviting, setInviting] = useState(false);

  const [selectedMember, setSelectedMember] = useState<OrganizationUser | null>(
    null
  );
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);
  const [newRole, setNewRole] = useState<Role>("ANGGOTA");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [cancelingInvite, setCancelingInvite] = useState(false);

  const isKetua = auth.user?.role === "KETUA";

  useEffect(() => {
    if (!auth.user?.organization) {
      router.push("/");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.organization, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        axios.get("/api/organization/members"),
        isKetua
          ? axios.get("/api/organization/invitations")
          : Promise.resolve({ data: { data: [] } }),
      ]);
      if (membersRes.data.success) setMembers(membersRes.data.data);
      if (invitationsRes.data.data) setInvitations(invitationsRes.data.data);
    } catch {
      addToast({
        title: "Error",
        description: "Gagal memuat data",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await axios.post("/api/organization/invitations", {
        email: inviteEmail,
        role: inviteRole,
      });
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Undangan berhasil dikirim",
          color: "success",
        });
        setInvitations([res.data.data, ...invitations]);
        setInviteEmail("");
        setInviteRole("ANGGOTA");
        inviteModal.onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        color: "danger",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    setUpdatingRole(true);
    try {
      const res = await axios.put("/api/organization/members", {
        memberId: selectedMember.id,
        role: newRole,
      });
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Role berhasil diperbarui",
          color: "success",
        });
        if (newRole === "KETUA") {
          auth.refreshUser();
        }
        fetchData();
        roleModal.onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        color: "danger",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    setRemoving(true);
    try {
      const res = await axios.delete("/api/organization/members", {
        data: { memberId: selectedMember.id },
      });
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Anggota berhasil dikeluarkan",
          color: "success",
        });
        setMembers(members.filter((m) => m.id !== selectedMember.id));
        removeModal.onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        color: "danger",
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleCancelInvitation = async () => {
    if (!selectedInvitation) return;
    setCancelingInvite(true);
    try {
      const res = await axios.delete("/api/organization/invitations", {
        data: { invitationId: selectedInvitation.id },
      });
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Undangan dibatalkan",
          color: "success",
        });
        setInvitations(
          invitations.filter((i) => i.id !== selectedInvitation.id)
        );
        cancelInviteModal.onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        title: "Gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        color: "danger",
      });
    } finally {
      setCancelingInvite(false);
    }
  };

  const openCancelInviteModal = (invitation: Invitation) => {
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

  if (loading) {
    return (
      <main className="p-4 space-y-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </main>
    );
  }

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
            <Tab key="members" title={`Anggota (${members.length})`} />
            <Tab key="invitations" title={`Undangan (${invitations.length})`} />
          </Tabs>
        )}

        {selectedTab === "members" ? (
          <div className="space-y-2">
            {members.map((member) => (
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
            {invitations.length === 0 ? (
              <Card className="shadow-sm">
                <CardBody className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    Tidak ada undangan pending
                  </p>
                </CardBody>
              </Card>
            ) : (
              invitations.map((invitation) => (
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
            <Button color="primary" isLoading={inviting} onPress={handleInvite}>
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
              isLoading={updatingRole}
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
              isLoading={removing}
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
              isLoading={cancelingInvite}
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
