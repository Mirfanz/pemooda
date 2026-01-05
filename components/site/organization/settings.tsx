"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  Skeleton,
  addToast,
} from "@heroui/react";
import { SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { OrganizationFull } from "@/types";
import { useRouter } from "next/navigation";
import Navbar from "../navbar";

export default function OrganizationSettings() {
  const auth = useAuth();
  const router = useRouter();
  const [organization, setOrganization] = useState<OrganizationFull | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    address: "",
    phone: "",
    instagramUrl: "",
    facebookUrl: "",
    twitterUrl: "",
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await axios.get("/api/organization/detail");
        if (res.data.success) {
          const org = res.data.data;
          setOrganization(org);
          setFormData({
            name: org.name || "",
            tagline: org.tagline || "",
            address: org.details?.address || "",
            phone: org.details?.phone || "",
            instagramUrl: org.details?.instagramUrl || "",
            facebookUrl: org.details?.facebookUrl || "",
            twitterUrl: org.details?.twitterUrl || "",
          });
        }
      } catch {
        addToast({
          title: "Error",
          description: "Gagal memuat data organisasi",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    if (auth.user?.organization) {
      fetchOrganization();
    } else {
      router.push("/");
    }
  }, [auth.user?.organization, router]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await axios.put("/api/organization/update", formData);
      if (res.data.success) {
        addToast({
          title: "Berhasil",
          description: "Data organisasi berhasil diperbarui",
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="p-4 space-y-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </main>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <main className="pb-4">
      <Navbar title="Pengaturan Organisasi" />

      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <Card className="shadow-sm">
          <CardBody className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Informasi Dasar
            </h3>
            <Input
              label="Nama Organisasi"
              placeholder="Masukkan nama organisasi"
              value={formData.name}
              onValueChange={(v) => setFormData({ ...formData, name: v })}
            />
            <Textarea
              label="Tagline"
              placeholder="Deskripsi singkat organisasi"
              value={formData.tagline}
              onValueChange={(v) => setFormData({ ...formData, tagline: v })}
              maxRows={3}
            />
          </CardBody>
        </Card>

        {/* Contact Info */}
        <Card className="shadow-sm">
          <CardBody className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Informasi Kontak
            </h3>
            <Input
              label="Nomor Telepon"
              placeholder="08xxxxxxxxxx"
              value={formData.phone}
              onValueChange={(v) => setFormData({ ...formData, phone: v })}
            />
            <Textarea
              label="Alamat"
              placeholder="Alamat lengkap organisasi"
              value={formData.address}
              onValueChange={(v) => setFormData({ ...formData, address: v })}
              maxRows={3}
            />
          </CardBody>
        </Card>

        {/* Social Media */}
        <Card className="shadow-sm">
          <CardBody className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Media Sosial
            </h3>
            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/..."
              value={formData.instagramUrl}
              onValueChange={(v) =>
                setFormData({ ...formData, instagramUrl: v })
              }
            />
            <Input
              label="Twitter URL"
              placeholder="https://twitter.com/..."
              value={formData.twitterUrl}
              onValueChange={(v) => setFormData({ ...formData, twitterUrl: v })}
            />
            <Input
              label="Facebook URL"
              placeholder="https://facebook.com/..."
              value={formData.facebookUrl}
              onValueChange={(v) =>
                setFormData({ ...formData, facebookUrl: v })
              }
            />
          </CardBody>
        </Card>

        {/* Save Button */}
        <Button
          color="primary"
          className="w-full"
          size="lg"
          startContent={<SaveIcon className="w-5 h-5" />}
          isLoading={saving}
          onPress={handleSubmit}
        >
          Simpan Perubahan
        </Button>
      </div>
    </main>
  );
}
